const { HTTP_STATUS } = require('../constants');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, HTTP_STATUS.BAD_REQUEST);

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(`${field} '${value}' already exists`, HTTP_STATUS.CONFLICT);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Validation failed', HTTP_STATUS.UNPROCESSABLE, errors);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', HTTP_STATUS.UNAUTHORIZED);

const handleJWTExpiredError = () =>
  new AppError('Token expired. Please log in again', HTTP_STATUS.UNAUTHORIZED);

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    if (error.name === 'CastError') error = handleCastError(error);
    else if (error.code === 11000) error = handleDuplicateKeyError(error);
    else if (error.name === 'ValidationError') error = handleValidationError(error);
    else if (error.name === 'JsonWebTokenError') error = handleJWTError();
    else if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    else {
      error = new AppError(
        error.message || 'Internal Server Error',
        HTTP_STATUS.INTERNAL_SERVER
      );
    }
  }

  console.error('[Error]', {
    message: error.message,
    statusCode: error.statusCode,
    stack: err.stack,
  });

  return ApiResponse.error(res, {
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || undefined,
  });
};

module.exports = errorMiddleware;
