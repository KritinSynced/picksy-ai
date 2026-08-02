const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Parameter resolver to support both Mongoose ObjectId and Clerk ID transparently in all user routes
router.param('userId', async (req, res, next, userId) => {
  // If the userId is a special route like 'sync-clerk' or 'simulation-personas', skip processing
  if (userId === 'sync-clerk' || userId === 'simulation-personas') {
    return next();
  }
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(userId);
    let query = isObjectId ? { _id: userId } : { clerkId: userId };
    const user = await User.findOne(query).select('_id');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    req.params.userId = user._id.toString();
    next();
  } catch (err) {
    next(err);
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      preferences: {
        favoriteCategories: [],
        preferredBrands: [],
        priceRange: { min: 0, max: 10000 }
      },
      browsingHistory: [],
      purchaseHistory: [],
      cart: []
    });

    const newUser = await user.save();
    
    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      message: 'User created successfully',
      user: userResponse
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(400).json({ message: 'Error creating user', error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last active
    await user.updateLastActive();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      message: 'Login successful',
      user: userResponse
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Sync Clerk user with local database
router.post('/sync-clerk', async (req, res) => {
  try {
    const { clerkId, email, fullName } = req.body;
    
    if (!clerkId || !email) {
      return res.status(400).json({ message: 'clerkId and email are required' });
    }

    // Find user by clerkId
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Find user by email (incase they registered previously via local credentials)
      user = await User.findOne({ email });
      
      if (user) {
        // Link Clerk ID to existing user profile
        user.clerkId = clerkId;
        if (fullName && !user.fullName) user.fullName = fullName;
        await user.save();
      } else {
        // Create new user profile for Clerk user
        // Assign random demographics representing a general active buyer
        const ages = [22, 28, 34, 42, 51];
        const genders = ['Female', 'Male', 'Non-binary'];
        const interestGroups = [
          ['tech', 'gaming'],
          ['fashion', 'beauty'],
          ['sports', 'wellness'],
          ['cooking', 'decor'],
          ['toys', 'reading']
        ];
        const locations = ['Mumbai, MH', 'Bangalore, KA', 'Delhi, DL', 'Pune, MH'];
        
        const rIndex = Math.floor(Math.random() * 5);
        const age = ages[rIndex];
        const gender = genders[rIndex % 3];
        const interests = interestGroups[rIndex];
        const location = locations[rIndex % 4];
        
        // Stated preferences
        const favCategories = [];
        interests.forEach(interest => {
          if (interest === 'tech') favCategories.push('electronics', 'gaming');
          if (interest === 'fashion') favCategories.push('fashion', 'beauty');
          if (interest === 'sports') favCategories.push('sports');
          if (interest === 'cooking') favCategories.push('grocery', 'home_kitchen');
          if (interest === 'decor') favCategories.push('furniture', 'home_kitchen');
          if (interest === 'wellness') favCategories.push('health', 'beauty');
          if (interest === 'toys') favCategories.push('toys');
        });

        // Initialize embeddings matching interests
        const emb = Array(8).fill(0.1);
        interests.forEach(interest => {
          if (interest === 'tech') emb[0] += 0.5;
          if (interest === 'fashion') emb[1] += 0.5;
          if (interest === 'sports') emb[2] += 0.5;
          if (interest === 'cooking' || interest === 'decor') emb[3] += 0.5;
          if (interest === 'wellness') emb[6] += 0.5;
          if (interest === 'gaming') emb[7] += 0.5;
        });
        const mag = Math.sqrt(emb.reduce((sum, val) => sum + val * val, 0));
        const embeddings = emb.map(v => Number((v / mag).toFixed(4)));

        user = new User({
          clerkId,
          username: `clerk_${clerkId.slice(-6)}`,
          email,
          fullName: fullName || `User_${clerkId.slice(-6)}`,
          age,
          gender,
          interests,
          shoppingFrequency: 'Weekly',
          budgetTier: 'Medium',
          location,
          embeddings,
          preferences: {
            favoriteCategories: favCategories,
            preferredBrands: [],
            priceRange: { min: 0, max: 15000 }
          },
          browsingHistory: [],
          purchaseHistory: [],
          cart: []
        });

        await user.save();
      }
    }

    res.json({
      message: 'Clerk user synced successfully',
      user
    });
  } catch (err) {
    console.error('Error syncing Clerk user:', err);
    res.status(500).json({ message: 'Error syncing Clerk user', error: err.message });
  }
});

// Get simulation personas for Sandbox Mode
router.get('/simulation-personas', async (req, res) => {
  try {
    // Select 5 users with distinct budget tiers or categories
    const personas = await User.find({ clerkId: { $exists: false } })
      .limit(5)
      .select('fullName age gender interests budgetTier location preferences.favoriteCategories');
    res.json(personas);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching personas', error: err.message });
  }
});

// Get user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('browsingHistory.productId')
      .populate('purchaseHistory.productId')
      .populate('cart.productId')
      .populate('savedRecommendations.productId')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { fullName, preferences } = req.body;
    const updates = {};
    
    if (fullName) updates.fullName = fullName;
    if (preferences) updates.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(400).json({ message: 'Error updating profile', error: err.message });
  }
});

// Add to browsing history
router.post('/:userId/browse', async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.addToBrowsingHistory(productId);

    res.json({ message: 'Added to browsing history' });
  } catch (err) {
    console.error('Error adding to browsing history:', err);
    res.status(500).json({ message: 'Error updating browsing history', error: err.message });
  }
});

// Add to cart
router.post('/:userId/cart', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.addToCart(productId, quantity);

    // Return updated cart
    await user.populate('cart.productId');
    res.json({ 
      message: 'Added to cart',
      cart: user.cart 
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Error updating cart', error: err.message });
  }
});

// Remove from cart
router.delete('/:userId/cart/:productId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter(
      item => item.productId.toString() !== req.params.productId
    );
    await user.save();

    res.json({ 
      message: 'Removed from cart',
      cart: user.cart 
    });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Error updating cart', error: err.message });
  }
});

// Update user preferences
router.put('/:userId/preferences', async (req, res) => {
  try {
    const { favoriteCategories, preferredBrands, priceRange } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (favoriteCategories) user.preferences.favoriteCategories = favoriteCategories;
    if (preferredBrands) user.preferences.preferredBrands = preferredBrands;
    if (priceRange) user.preferences.priceRange = priceRange;

    await user.save();

    res.json({
      message: 'Preferences updated',
      preferences: user.preferences
    });
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ message: 'Error updating preferences', error: err.message });
  }
});

// Checkout / Purchase cart items
router.post('/:userId/purchase', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { items } = req.body; // Array of { productId, price, quantity }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items to purchase' });
    }

    // Append items to purchaseHistory
    items.forEach(item => {
      user.purchaseHistory.push({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity || 1,
        purchasedAt: new Date()
      });
    });

    // Clear user cart
    user.cart = [];
    await user.save();

    res.json({
      message: 'Purchase completed successfully',
      purchaseHistory: user.purchaseHistory,
      cart: user.cart
    });
  } catch (err) {
    console.error('Error processing purchase:', err);
    res.status(500).json({ message: 'Error processing purchase', error: err.message });
  }
});

module.exports = router;