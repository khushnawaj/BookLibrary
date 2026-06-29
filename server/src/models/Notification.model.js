const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1 });

// Automatically invalidate Redis cache when a notification is created
notificationSchema.post('save', async function (doc) {
  try {
    const { redisClient } = require('../../config/redis');
    if (redisClient && redisClient.isOpen) {
      await redisClient.del(`notifications:${doc.recipient}`);
    }
  } catch (err) {
    console.error('Failed to invalidate notification cache on save:', err);
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
