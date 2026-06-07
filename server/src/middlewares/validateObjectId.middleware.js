const mongoose = require('mongoose');
const { HTTP_STATUS } = require('../constants');
const AppError = require('../utils/AppError');

const validateObjectId =
  (paramName = 'id', location = 'params') =>
  (req, _res, next) => {
    const value = req[location][paramName];

    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
      return next(new AppError(`Invalid ${paramName}`, HTTP_STATUS.BAD_REQUEST));
    }

    if (String(new mongoose.Types.ObjectId(value)) !== value) {
      return next(new AppError(`Invalid ${paramName}`, HTTP_STATUS.BAD_REQUEST));
    }

    next();
  };

module.exports = validateObjectId;
