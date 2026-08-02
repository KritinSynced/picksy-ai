const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Interaction = require('../models/Interaction');

// Simple dot product helper for latent embeddings
const dotProduct = (v1, v2) => {
  if (!v1 || !v2 || v1.length === 0 || v2.length === 0) return 0;
  return v1.reduce((sum, val, idx) => sum + val * (v2[idx] || 0), 0);
};

// Calculate IDF of tags dynamically within a candidate pool
const getTagIDFMap = (products) => {
  const idf = {};
  const N = products.length;
  products.forEach(p => {
    const uniqueTags = new Set(p.tags || []);
    uniqueTags.forEach(t => {
      idf[t] = (idf[t] || 0) + 1;
    });
  });
  Object.keys(idf).forEach(t => {
    idf[t] = Math.log(N / idf[t]) + 1; // standard IDF formula
  });
  return idf;
};

// Advanced Recommendation logic
const getSmartRecommendations = async (userId, limit = 12) => {
  try {
    // 1. Cold Start / Guest User Fallback
    if (!userId || userId === 'guest' || userId === 'null' || userId === 'undefined') {
      return await Product.find({})
        .sort({ trendingScore: -1, rating: -1 })
        .limit(limit);
    }

    // 2. Fetch User Profile
    const user = await User.findById(userId)
      .populate('browsingHistory.productId')
      .populate('purchaseHistory.productId');
    
    if (!user) {
      // User ID not found in database (e.g. deleted or guest), return general trending
      return await Product.find({}).sort({ trendingScore: -1 }).limit(limit);
    }

    // 3. Generate Candidate Pool
    // To ensure fast API response times (<10ms) while scanning 100k products,
    // we query a high-quality candidate pool of 200 products using MongoDB indexes.
    const favCategories = user.preferences?.favoriteCategories || [];
    const budgetTier = user.budgetTier || 'Medium';

    // Build candidate queries
    const candidateQuery = {};
    
    // Narrow candidates by categories they prefer, plus some trending items
    const categoryQuery = favCategories.length > 0 
      ? { category: { $in: favCategories } } 
      : {};

    const [prefCandidates, trendingCandidates, newCandidates] = await Promise.all([
      Product.find(categoryQuery).sort({ popularityScore: -1 }).limit(100),
      Product.find({}).sort({ trendingScore: -1 }).limit(60),
      Product.find({}).sort({ createdAt: -1 }).limit(40)
    ]);

    // De-duplicate candidate pool
    const poolMap = new Map();
    [...prefCandidates, ...trendingCandidates, ...newCandidates].forEach(p => {
      poolMap.set(p._id.toString(), p);
    });
    
    const candidates = Array.from(poolMap.values());

    // Exclude products user has already purchased or viewed multiple times
    const purchasedIds = new Set(user.purchaseHistory.map(h => h.productId?.toString()).filter(Boolean));
    const viewedIds = new Set(user.browsingHistory.map(h => h.productId?.toString()).filter(Boolean));

    // Get tag IDF dictionary of candidate pool for TF-IDF content filtering
    const tagIDF = getTagIDFMap(candidates);

    // Compute user preferences vector based on browsing history for content matching
    const userTagsHistoryCount = {};
    let totalBrowsingTags = 0;
    user.browsingHistory.forEach(history => {
      if (history.productId && history.productId.tags) {
        history.productId.tags.forEach(t => {
          userTagsHistoryCount[t] = (userTagsHistoryCount[t] || 0) + 1;
          totalBrowsingTags++;
        });
      }
    });

    // 4. Scoring Pipeline
    const scoredCandidates = candidates.map(product => {
      const productIdStr = product._id.toString();

      // Skip if already purchased
      if (purchasedIds.has(productIdStr)) return null;

      // Calculate components:
      
      // A. Collaborative Filtering Score (Latent Embeddings dot product)
      const collaborativeScore = dotProduct(user.embeddings, product.embeddings);

      // B. Content-Based TF-IDF Score
      let contentScore = 0;
      if (totalBrowsingTags > 0 && product.tags) {
        let tagMatchesWeight = 0;
        product.tags.forEach(t => {
          if (userTagsHistoryCount[t]) {
            // TF-IDF style tag matching weight
            tagMatchesWeight += (userTagsHistoryCount[t] / totalBrowsingTags) * (tagIDF[t] || 1.0);
          }
        });
        contentScore = Math.min(tagMatchesWeight, 1);
      } else {
        // Fallback: match favorite categories
        contentScore = favCategories.includes(product.category) ? 0.6 : 0.1;
      }

      // C. Price Tier Affinity Score
      let priceScore = 0.5; // Neutral
      const price = product.price;
      if (budgetTier === 'Low') {
        priceScore = price < 1500 ? 0.9 : price < 5000 ? 0.4 : 0.1;
      } else if (budgetTier === 'High') {
        priceScore = price > 20000 ? 0.9 : price > 5000 ? 0.5 : 0.2;
      } else { // Medium
        priceScore = (price >= 1500 && price <= 20000) ? 0.9 : (price < 1500) ? 0.5 : 0.3;
      }

      // D. Quality / Social Proof Bonus
      const qualityScore = (product.rating / 5) * 0.15 + Math.min(product.reviews?.length || 0, 50) * 0.001;

      // Hybrid Weight combination: 50% Collaborative + 25% Content + 15% Price Match + 10% Quality
      const hybridScore = (collaborativeScore * 0.5) + (contentScore * 0.25) + (priceScore * 0.15) + (qualityScore * 0.1);

      // Determine recommendation reason
      let reason = `Recommended for your profile`;
      if (favCategories.includes(product.category) && Math.random() > 0.5) {
        reason = `Based on your interest in ${product.category}`;
      } else if (product.brand && Math.random() > 0.7) {
        reason = `Top rated from ${product.brand}`;
      } else if (contentScore > 0.4) {
        reason = `Similar to items in your history`;
      } else if (product.trendingScore > 200) {
        reason = `Trending in ${product.category}`;
      }

      return {
        product,
        score: hybridScore,
        reason
      };
    }).filter(Boolean);

    // Sort by hybridScore descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // 5. Diversity Filtering
    // To maintain layout visual richness, prevent recommending more than 3 products in the same category
    const finalRecommendations = [];
    const categoryCount = {};

    for (const item of scoredCandidates) {
      const cat = item.product.category;
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      
      if (categoryCount[cat] <= 3) {
        // Attach the calculated reason to product object dynamically for UI consumption
        const itemDoc = item.product.toObject();
        itemDoc.recommendationReason = item.reason;
        itemDoc.matchScore = Math.round(item.score * 100);
        finalRecommendations.push(itemDoc);
      }
      
      if (finalRecommendations.length >= limit) break;
    }

    // Fallback: If diversity filtering pruned too many, relax constraints
    if (finalRecommendations.length < limit && scoredCandidates.length > finalRecommendations.length) {
      for (const item of scoredCandidates) {
        if (!finalRecommendations.some(x => x._id.toString() === item.product._id.toString())) {
          const itemDoc = item.product.toObject();
          itemDoc.recommendationReason = item.reason;
          itemDoc.matchScore = Math.round(item.score * 100);
          finalRecommendations.push(itemDoc);
        }
        if (finalRecommendations.length >= limit) break;
      }
    }

    return finalRecommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

// --- ROUTES ---

// 1. GET Personalized Recommendations for User
router.get('/user/:userId', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 12;
    const recommendations = await getSmartRecommendations(req.params.userId, limit);
    
    // Cache the recommendations inside the User document for session reference
    if (req.params.userId !== 'guest' && recommendations.length > 0) {
      try {
        await User.findByIdAndUpdate(req.params.userId, {
          savedRecommendations: recommendations.slice(0, 10).map(r => ({
            productId: r._id,
            reason: r.recommendationReason,
            date: new Date()
          }))
        });
      } catch (err) {
        console.error('Failed to cache user recommendations:', err);
      }
    }

    res.json(recommendations);
  } catch (err) {
    console.error('Error in recommendations endpoint:', err);
    res.status(500).json({ message: 'Error fetching recommendations', error: err.message });
  }
});

// 2. GET Trending Products
router.get('/trending', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 12;
    const trending = await Product.find({})
      .sort({ trendingScore: -1, rating: -1 })
      .limit(limit);
    res.json(trending);
  } catch (err) {
    console.error('Error fetching trending products:', err);
    res.status(500).json({ message: 'Error fetching trending products', error: err.message });
  }
});

// 3. POST Fetch Similar Products for product details
router.post('/similar', async (req, res) => {
  try {
    const { productId } = req.body;
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId)
      .populate({
        path: 'similarProducts',
        options: { limit }
      });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If precomputed similar list is empty (cold item), scan category dynamically
    if (!product.similarProducts || product.similarProducts.length === 0) {
      const dynamicSimilar = await Product.find({
        category: product.category,
        _id: { $ne: product._id }
      })
      .sort({ popularityScore: -1 })
      .limit(limit);
      return res.json(dynamicSimilar);
    }

    res.json(product.similarProducts);
  } catch (err) {
    console.error('Error fetching similar products:', err);
    res.status(500).json({ message: 'Error fetching similar products', error: err.message });
  }
});

// 4. POST Fetch Frequently Bought Together combo deals
router.post('/frequently-bought', async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId)
      .populate({
        path: 'frequentlyBoughtTogether',
        options: { limit: 3 }
      });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fallback if none precomputed
    if (!product.frequentlyBoughtTogether || product.frequentlyBoughtTogether.length === 0) {
      const fallbackItems = await Product.find({
        category: product.category,
        subcategory: product.subcategory,
        _id: { $ne: product._id }
      })
      .sort({ rating: -1 })
      .limit(3);
      return res.json(fallbackItems);
    }

    res.json(product.frequentlyBoughtTogether);
  } catch (err) {
    console.error('Error fetching FBT products:', err);
    res.status(500).json({ message: 'Error fetching frequently bought items', error: err.message });
  }
});

// 5. GET Browse History-Based Recommendations
router.get('/history-based/:userId', async (req, res) => {
  try {
    if (req.params.userId === 'guest') {
      const generalPopular = await Product.find({}).sort({ popularityScore: -1 }).limit(8);
      return res.json(generalPopular);
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const viewedProductIds = user.browsingHistory.map(h => h.productId).filter(Boolean);
    if (viewedProductIds.length === 0) {
      const generalPopular = await Product.find({}).sort({ popularityScore: -1 }).limit(8);
      return res.json(generalPopular);
    }

    // Get the details of the most recently viewed product
    const lastViewedProduct = await Product.findById(viewedProductIds[viewedProductIds.length - 1])
      .populate('similarProducts');
    
    if (lastViewedProduct && lastViewedProduct.similarProducts && lastViewedProduct.similarProducts.length > 0) {
      return res.json(lastViewedProduct.similarProducts.slice(0, 8));
    }

    // Fallback: search items in viewed categories
    const viewedProducts = await Product.find({ _id: { $in: viewedProductIds } });
    const categories = [...new Set(viewedProducts.map(p => p.category))];

    const recommendations = await Product.find({
      category: { $in: categories },
      _id: { $nin: viewedProductIds }
    })
    .sort({ popularityScore: -1 })
    .limit(8);

    res.json(recommendations);
  } catch (err) {
    console.error('Error in history-based recommendations:', err);
    res.status(500).json({ message: 'Error fetching recommendations', error: err.message });
  }
});

module.exports = router;