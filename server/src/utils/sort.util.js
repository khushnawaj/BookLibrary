const BOOK_SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  title: { title: 1 },
};

const LIBRARY_SORT_MAP = {
  newest: { updatedAt: -1 },
  oldest: { updatedAt: 1 },
};

const parseBookSort = (sortBy) => BOOK_SORT_MAP[sortBy] || BOOK_SORT_MAP.newest;

const parseLibrarySort = (sortBy) => LIBRARY_SORT_MAP[sortBy] || LIBRARY_SORT_MAP.newest;

module.exports = { parseBookSort, parseLibrarySort, BOOK_SORT_MAP, LIBRARY_SORT_MAP };
