const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { Book, Library } = require('../models');
const { SHELF_TYPES } = require('../constants');

const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalBooks, libraryStats, recentLibrary] = await Promise.all([
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
    Library.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(6)
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
      recentBooks: recentLibrary,
      recentActivity: recentLibrary,
    },
  });
});

module.exports = { getDashboardStats };
