const { HTTP_STATUS } = require('../constants');
const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', err);
  }

  ApiResponse.error(res, {
    statusCode,
    message,
    errors: err.errors || undefined,
  });
};

module.exports = errorHandler;
