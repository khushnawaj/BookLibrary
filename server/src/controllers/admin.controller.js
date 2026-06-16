const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { User, Post, Book, Activity, Comment, Library, Like, SavedPost, Follow } = require('../models');
const { HTTP_STATUS } = require('../constants');

// =====================================
// OVERVIEW STATISTICS & HEALTH
// =====================================
const getOverview = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPosts,
    totalBooks,
    totalActivities,
    recentActivities,
    activityBreakdown
  ] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Book.countDocuments(),
    Activity.countDocuments(),
    Activity.find()
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('user', 'name username avatar email'),
    Activity.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ])
  ]);

  const activityCounts = {};
  activityBreakdown.forEach((item) => {
    activityCounts[item._id] = item.count;
  });

  return ApiResponse.success(res, {
    message: 'Admin stats retrieved successfully',
    data: {
      stats: {
        totalUsers,
        totalPosts,
        totalBooks,
        totalActivities,
        activityCounts
      },
      recentActivities
    }
  });
});

// =====================================
// USER MANAGEMENT
// =====================================
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, {
    message: 'Users list retrieved successfully',
    data: users
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['ADMIN', 'MEMBER'].includes(role)) {
    throw new AppError('Invalid role specified', HTTP_STATUS.BAD_REQUEST);
  }

  // Prevent users from demoting themselves
  if (id === req.user._id.toString() && role !== 'ADMIN') {
    throw new AppError('You cannot demote yourself from Admin status', HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  return ApiResponse.success(res, {
    message: 'User role updated successfully',
    data: user
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    throw new AppError('You cannot delete your own admin account', HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  // Delete user-related entries across schemas
  await Promise.all([
    User.findByIdAndDelete(id),
    Post.deleteMany({ author: id }),
    Comment.deleteMany({ user: id }),
    Library.deleteMany({ user: id }),
    Like.deleteMany({ user: id }),
    SavedPost.deleteMany({ user: id }),
    Follow.deleteMany({ $or: [{ follower: id }, { following: id }] }),
    Activity.deleteMany({ user: id })
  ]);

  return ApiResponse.success(res, {
    message: 'User and all associated data deleted successfully'
  });
});

module.exports = {
  getOverview,
  getUsers,
  updateUserRole,
  deleteUser
};
