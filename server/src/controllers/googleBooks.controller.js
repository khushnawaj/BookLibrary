const googleBooksService = require('../services/googleBooks.service');
const ApiResponse = require('../utils/apiResponse');

module.exports.searchGoogleBooks = async (req, res, next) => {
  try {
    const { query } = req.query;
    const result = await googleBooksService.searchBooks(query);

    return ApiResponse.success(res, {
      message: 'Google Books search completed',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
