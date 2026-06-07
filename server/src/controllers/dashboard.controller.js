const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { Book, Library } = require('../models');
const { SHELF_TYPES } = require('../constants');

const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalBooks, libraryStats, recentBooks, recentLibrary] = await Promise.all([
    Book.countDocuments({ owner: userId }),
    Library.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$shelfType',
          count: { $sum: 1 },
        },
      },
    ]),
    Book.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title author genre coverImage createdAt')
      .lean(),
    Library.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('book', 'title author genre coverImage')
      .lean(),
  ]);

  const shelfCounts = libraryStats.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return ApiResponse.success(res, {
    message: 'Dashboard stats retrieved successfully',
    data: {
      stats: {
        totalBooks,
        readBooks: shelfCounts[SHELF_TYPES.READ] || 0,
        readingBooks: shelfCounts[SHELF_TYPES.READING] || 0,
        wishlistCount: shelfCounts[SHELF_TYPES.WISHLIST] || 0,
        droppedBooks: shelfCounts[SHELF_TYPES.DROPPED] || 0,
      },
      recentBooks,
      recentActivity: recentLibrary,
    },
  });
});

module.exports = { getDashboardStats };
