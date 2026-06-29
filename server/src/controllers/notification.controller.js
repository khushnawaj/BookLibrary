const { Notification } = require('../models');
const { HTTP_STATUS } = require('../constants');
const { redisClient } = require('../../config/redis');

// Safe check to verify if Redis connection is active
const isRedisConnected = () => {
  return redisClient && redisClient.isOpen;
};

const getNotifications = async (req, res) => {
  const userId = req.auth.userId;
  const cacheKey = `notifications:${userId}`;

  try {
    // 1. Try fetching from Redis cache
    if (isRedisConnected()) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return res.status(HTTP_STATUS.OK).json({
            success: true,
            data: JSON.parse(cachedData),
            fromCache: true
          });
        }
      } catch (cacheErr) {
        console.error('Redis cache retrieval failed:', cacheErr);
      }
    }

    // 2. Cache miss - Query DB
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    // 3. Save to Redis cache (TTL: 5 minutes)
    if (isRedisConnected()) {
      try {
        await redisClient.setEx(cacheKey, 300, JSON.stringify(notifications));
      } catch (cacheErr) {
        console.error('Redis cache write failed:', cacheErr);
      }
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve notifications.',
    });
  }
};

const markAllRead = async (req, res) => {
  const userId = req.auth.userId;
  const cacheKey = `notifications:${userId}`;

  try {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // Invalidate Redis cache
    if (isRedisConnected()) {
      try {
        await redisClient.del(cacheKey);
      } catch (cacheErr) {
        console.error('Redis cache invalidation failed:', cacheErr);
      }
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update notifications.',
    });
  }
};

module.exports = {
  getNotifications,
  markAllRead,
};
