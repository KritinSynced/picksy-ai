const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId (Simulated user), String ('guest'), or Clerk ID string
    required: true 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['view', 'click', 'cart', 'purchase', 'wishlist', 'rating'], 
    required: true 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  searchQuery: { 
    type: String 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Create indexes for efficient analytics querying and recommendations aggregation
interactionSchema.index({ userId: 1, type: 1 });
interactionSchema.index({ productId: 1, type: 1 });
interactionSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
