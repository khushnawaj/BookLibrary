const { HTTP_STATUS } = require('../constants');

class ApiResponse {
  static success(res, { statusCode = HTTP_STATUS.OK, message, data = null, meta = null }) {
    const payload = { success: true, message };

    if (data !== null) payload.data = data;
    if (meta !== null) payload.meta = meta;

    return res.status(statusCode).json(payload);
  }

  static error(res, { statusCode = HTTP_STATUS.INTERNAL_SERVER, message, errors = null }) {
    const payload = { success: false, message };

    if (errors) payload.errors = errors;

    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
