const mongoose = require("mongoose");

const subscriptionExpirationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('SubscriptionExpiration', subscriptionExpirationSchema);