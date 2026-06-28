const { HTTP_STATUS } = require('../constants');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const bookService = require('../services/book.service');

const createBook = asyncHandler(async (req, res) => {
  const book = await bookService.createBook(req.user._id, req.body);

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Book created successfully',
    data: { book },
  });
});

const getBooks = asyncHandler(async (req, res) => {
  const { books, meta } = await bookService.getBooks(req.user._id, req.query);

  return ApiResponse.success(res, {
    message: 'Books retrieved successfully',
    data: { books },
    meta,
  });
});

const getBookById = asyncHandler(async (req, res) => {
  const book = await bookService.getBookById(req.user._id, req.params.id);

  return ApiResponse.success(res, {
    message: 'Book retrieved successfully',
    data: { book },
  });
});

// Public view — any authenticated user can view any book (used for feed references)
const getBookByIdPublic = asyncHandler(async (req, res) => {
  const book = await bookService.getBookByIdPublic(req.params.id);

  return ApiResponse.success(res, {
    message: 'Book retrieved successfully',
    data: { book },
  });
});

const updateBook = asyncHandler(async (req, res) => {
  const book = await bookService.updateBook(req.user._id, req.params.id, req.body);

  return ApiResponse.success(res, {
    message: 'Book updated successfully',
    data: { book },
  });
});

const deleteBook = asyncHandler(async (req, res) => {
  await bookService.deleteBook(req.user._id, req.params.id);

  return ApiResponse.success(res, {
    message: 'Book deleted successfully',
  });
});

module.exports = {
  createBook,
  getBooks,
  getBookById,
  getBookByIdPublic,
  updateBook,
  deleteBook,
};
