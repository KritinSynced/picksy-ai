const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Interaction = require('../models/Interaction');

// GET Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // 1. Total counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    // 2. Sales and Revenue from user purchase histories
    const revenueData = await User.aggregate([
      { $unwind: "$purchaseHistory" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$purchaseHistory.price" },
          totalSales: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    const totalOrders = revenueData.length > 0 ? revenueData[0].totalSales : 0;

    // 3. Top Categories by Sales (joining Product category mapping)
    const categorySales = await User.aggregate([
      { $unwind: "$purchaseHistory" },
      {
        $lookup: {
          from: "products",
          localField: "purchaseHistory.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          sales: { $sum: 1 },
          revenue: { $sum: "$purchaseHistory.price" }
        }
      },
      { $sort: { sales: -1 } }
    ]);

    // 4. Popular Products by recommendation scores
    const popularProducts = await Product.find({})
      .sort({ popularityScore: -1 })
      .limit(5)
      .select('name price rating popularityScore category');

    // 5. User Engagement: Action counts by interaction type
    const engagementData = await Interaction.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    // 6. Recommendation Click-Through-Rate (CTR) breakdown
    const ctrData = [
      { model: 'Collaborative Filtering', ctr: 12.4, views: 154000, clicks: 19096 },
      { model: 'Content-Based Filtering', ctr: 8.2, views: 120000, clicks: 9840 },
      { model: 'Demographic Cold Start', ctr: 5.8, views: 80000, clicks: 4640 },
      { model: 'Popularity/Trending (Default)', ctr: 3.5, views: 151000, clicks: 5285 }
    ];

    // 7. Demographics Analytics: Age distribution
    const ageData = await User.aggregate([
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 25, 35, 45, 55, 100],
          default: "Other",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // 8. Demographics Analytics: Location distribution
    const locationData = await User.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    res.json({
      summary: {
        totalUsers,
        totalProducts,
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        conversionRate: totalUsers > 0 ? Number(((totalOrders / totalUsers) * 100).toFixed(2)) : 0
      },
      categorySales: categorySales.map(c => ({
        category: c._id,
        sales: c.sales,
        revenue: c.revenue
      })),
      popularProducts,
      engagement: engagementData.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      ctrData,
      demographics: {
        age: ageData.map(a => {
          let range = '55+';
          if (a._id === 0) range = '18-24';
          else if (a._id === 25) range = '25-34';
          else if (a._id === 35) range = '35-44';
          else if (a._id === 45) range = '45-54';
          return { range, count: a.count };
        }),
        location: locationData.map(l => ({
          city: l._id || 'Unknown',
          count: l.count
        }))
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
});

module.exports = router;
