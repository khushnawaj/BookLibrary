const { HTTP_STATUS } = require('../constants');
const AppError = require('../utils/AppError');
const { Book, Library } = require('../models');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination.util');
const { buildBookSearchFilter } = require('../utils/search.util');
const { buildBookFilter } = require('../utils/filter.util');
const { parseBookSort } = require('../utils/sort.util');

const OWNER_FIELDS = 'name username avatar';

const getOwnerId = (owner) => (owner?._id ?? owner).toString();

const assertBookOwner = (book, userId) => {
  if (!book) {
    throw new AppError('Book not found', HTTP_STATUS.NOT_FOUND);
  }

  if (getOwnerId(book.owner) !== userId.toString()) {
    throw new AppError('You do not have permission to access this book', HTTP_STATUS.FORBIDDEN);
  }
};

const createBook = async (userId, bookData) => {
  if (bookData.isbn) {
    const existingIsbn = await Book.findOne({ isbn: bookData.isbn });
    if (existingIsbn) {
      throw new AppError('A book with this ISBN already exists', HTTP_STATUS.CONFLICT);
    }
  }

  const book = await Book.create({ ...bookData, owner: userId });
  await book.populate('owner', OWNER_FIELDS);

  return book;
};

const getBooks = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const sort = parseBookSort(query.sort);

  const filter = {
    owner: userId,
    ...buildBookSearchFilter(query.search),
    ...buildBookFilter(query),
  };

  const [books, total] = await Promise.all([
    Book.find(filter)
      .populate('owner', OWNER_FIELDS)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Book.countDocuments(filter),
  ]);

  return {
    books,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const getBookById = async (userId, bookId) => {
  const book = await Book.findById(bookId).populate('owner', OWNER_FIELDS);

  assertBookOwner(book, userId);

  return book;
};

const updateBook = async (userId, bookId, updateData) => {
  const book = await Book.findById(bookId);
  assertBookOwner(book, userId);

  if (updateData.isbn && updateData.isbn !== book.isbn) {
    const existingIsbn = await Book.findOne({ isbn: updateData.isbn, _id: { $ne: bookId } });
    if (existingIsbn) {
      throw new AppError('A book with this ISBN already exists', HTTP_STATUS.CONFLICT);
    }
  }

  Object.assign(book, updateData);
  await book.save();
  await book.populate('owner', OWNER_FIELDS);

  return book;
};

const deleteBook = async (userId, bookId) => {
  const book = await Book.findById(bookId);
  assertBookOwner(book, userId);

  await Promise.all([
    Book.deleteOne({ _id: bookId }),
    Library.deleteMany({ book: bookId }),
  ]);

  return book;
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
};
