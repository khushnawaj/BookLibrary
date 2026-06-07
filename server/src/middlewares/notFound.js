const { HTTP_STATUS } = require('../constants');
const ApiResponse = require('../utils/apiResponse');

const notFound = (req, res) => {
  ApiResponse.error(res, {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `Route not found: ${req.originalUrl}`,
  });
};

module.exports = notFound;
