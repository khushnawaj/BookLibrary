const { HTTP_STATUS } = require('../constants');
const AppError = require('../utils/AppError');

const authorize = (...roles) => (req, _res, next) => {
  if (!req.auth?.role) {
    return next(new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED));
  }

  if (!roles.includes(req.auth.role)) {
    return next(
      new AppError('You do not have permission to perform this action', HTTP_STATUS.FORBIDDEN)
    );
  }

  next();
};

module.exports = authorize;
