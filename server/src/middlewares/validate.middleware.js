const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../constants');
const AppError = require('../utils/AppError');

const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return next(
      new AppError('Validation failed', HTTP_STATUS.UNPROCESSABLE, formattedErrors)
    );
  }

  next();
};

module.exports = validate;
