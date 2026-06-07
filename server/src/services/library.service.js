const { HTTP_STATUS, SHELF_TYPES } = require('../constants');
const AppError = require('../utils/AppError');
const { Book, Library } = require('../models');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination.util');
const { buildLibraryFilter } = require('../utils/filter.util');
const { parseLibrarySort } = require('../utils/sort.util');

const BOOK_FIELDS =
  'title author publisher publicationDate isbn genre language pages coverImage description purchaseLinks owner';
const USER_FIELDS = 'name username avatar';

const getOwnerId = (owner) => (owner?._id ?? owner).toString();

const assertLibraryOwner = (entry, userId) => {
  if (!entry) {
    throw new AppError('Library entry not found', HTTP_STATUS.NOT_FOUND);
  }

  if (getOwnerId(entry.user) !== userId.toString()) {
    throw new AppError('You do not have permission to access this library entry', HTTP_STATUS.FORBIDDEN);
  }
};

const populateLibrary = (query) =>
  query.populate('book', BOOK_FIELDS).populate('user', USER_FIELDS);

const createLibraryEntry = async (userId, entryData) => {
  const book = await Book.findById(entryData.book);

  if (!book) {
    throw new AppError('Book not found', HTTP_STATUS.NOT_FOUND);
  }

  const existingEntry = await Library.findOne({ user: userId, book: entryData.book });

  if (existingEntry) {
    if (existingEntry.shelfType === (entryData.shelfType || SHELF_TYPES.WISHLIST)) {
      throw new AppError('This book is already on this shelf in your library', HTTP_STATUS.CONFLICT);
    }
    throw new AppError('This book is already in your library', HTTP_STATUS.CONFLICT);
  }

  try {
    const entry = await Library.create({
      ...entryData,
      user: userId,
      shelfType: entryData.shelfType || SHELF_TYPES.WISHLIST,
    });

    return populateLibrary(Library.findById(entry._id));
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('This book is already in your library', HTTP_STATUS.CONFLICT);
    }
    throw error;
  }
};

const getLibraryEntries = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const sort = parseLibrarySort(query.sort);

  const filter = {
    user: userId,
    ...buildLibraryFilter(query),
  };

  const [entries, total] = await Promise.all([
    populateLibrary(Library.find(filter).sort(sort).skip(skip).limit(limit)).lean({
      virtuals: true,
    }),
    Library.countDocuments(filter),
  ]);

  return {
    entries,
    meta: buildPaginationMeta({ page, limit, total }),
  };
};

const getLibraryEntryById = async (userId, entryId) => {
  const entry = await populateLibrary(Library.findById(entryId));
  assertLibraryOwner(entry, userId);
  return entry;
};

const updateLibraryEntry = async (userId, entryId, updateData) => {
  const entry = await Library.findById(entryId);
  assertLibraryOwner(entry, userId);

  if (updateData.book && updateData.book !== entry.book.toString()) {
    throw new AppError('Book reference cannot be changed', HTTP_STATUS.BAD_REQUEST);
  }

  delete updateData.book;
  delete updateData.user;

  Object.assign(entry, updateData);
  await entry.save();

  return populateLibrary(Library.findById(entryId));
};

const deleteLibraryEntry = async (userId, entryId) => {
  const entry = await Library.findById(entryId);
  assertLibraryOwner(entry, userId);

  await Library.deleteOne({ _id: entryId });

  return entry;
};

module.exports = {
  createLibraryEntry,
  getLibraryEntries,
  getLibraryEntryById,
  updateLibraryEntry,
  deleteLibraryEntry,
};
