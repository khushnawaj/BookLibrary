const { HTTP_STATUS } = require('../constants');
const ApiResponse = require('../utils/apiResponse');

const buckets = new Map();

const createRateLimiter = ({
  windowMs,
  max,
  message = 'Too many requests. Please try again later.',
  keyPrefix = 'global',
}) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${keyPrefix}:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfterSeconds));

      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
        message,
      });
    }

    return next();
  };
};

setInterval(() => {
  const now = Date.now();

  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) {
      buckets.delete(key);
    }
  }
}, 60 * 1000).unref();

module.exports = {
  createRateLimiter,
};
