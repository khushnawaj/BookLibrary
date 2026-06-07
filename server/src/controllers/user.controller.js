const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { User, Follow, Activity, Library, Post, Like, SavedPost } = require('../models');
const { HTTP_STATUS, SHELF_TYPES } = require('../constants');
const libraryService = require('../services/library.service');

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user ? req.user._id : null;

  const profileUser = await User.findOne({ username }).select('-password');
  if (!profileUser) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  // Check visibility
  if (profileUser.profileVisibility === 'PRIVATE' && (!currentUserId || currentUserId.toString() !== profileUser._id.toString())) {
    throw new AppError('This profile is private', HTTP_STATUS.FORBIDDEN);
  }

  let isFollowing = false;
  if (profileUser.profileVisibility === 'FOLLOWERS_ONLY') {
    if (!currentUserId) throw new AppError('This profile is for followers only', HTTP_STATUS.FORBIDDEN);
    if (currentUserId.toString() !== profileUser._id.toString()) {
      const follow = await Follow.findOne({ follower: currentUserId, following: profileUser._id });
      if (!follow) throw new AppError('This profile is for followers only', HTTP_STATUS.FORBIDDEN);
      isFollowing = true;
    }
  }

  if (currentUserId && currentUserId.toString() !== profileUser._id.toString() && profileUser.profileVisibility === 'PUBLIC') {
    const follow = await Follow.findOne({ follower: currentUserId, following: profileUser._id });
    isFollowing = !!follow;
  }

  const [followersCount, followingCount, booksRead] = await Promise.all([
    Follow.countDocuments({ following: profileUser._id }),
    Follow.countDocuments({ follower: profileUser._id }),
    Library.countDocuments({ user: profileUser._id, shelfType: SHELF_TYPES.READ }),
  ]);

  return ApiResponse.success(res, {
    message: 'Profile retrieved successfully',
    data: {
      profile: {
        ...profileUser.toObject(),
        followersCount,
        followingCount,
        booksRead,
        isFollowing,
      }
    }
  });
});

const followUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  if (id === currentUserId.toString()) {
    throw new AppError('You cannot follow yourself', HTTP_STATUS.BAD_REQUEST);
  }

  const userToFollow = await User.findById(id);
  if (!userToFollow) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  const existingFollow = await Follow.findOne({ follower: currentUserId, following: id });
  if (existingFollow) {
    throw new AppError('Already following this user', HTTP_STATUS.BAD_REQUEST);
  }

  await Follow.create({ follower: currentUserId, following: id });

  return ApiResponse.success(res, { message: 'Successfully followed user' });
});

const unfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  await Follow.findOneAndDelete({ follower: currentUserId, following: id });

  return ApiResponse.success(res, { message: 'Successfully unfollowed user' });
});

const getFollowers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const followers = await Follow.find({ following: id }).populate('follower', 'name username avatar bio');
  return ApiResponse.success(res, { message: 'Followers retrieved', data: followers });
});

const getFollowing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const following = await Follow.find({ follower: id }).populate('following', 'name username avatar bio');
  return ApiResponse.success(res, { message: 'Following retrieved', data: following });
});

const getActivities = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const activities = await Activity.find({ user: id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('referenceId'); // Assuming it can populate depending on type
    
  return ApiResponse.success(res, { message: 'Activities retrieved', data: activities });
});

const updateProfile = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { name, username, bio, avatar, bannerImage } = req.body;

  const user = await User.findById(currentUserId);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  if (username && username !== user.username) {
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      throw new AppError('Username is already taken', HTTP_STATUS.BAD_REQUEST);
    }
    user.username = username.toLowerCase();
  }

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (bannerImage !== undefined) user.bannerImage = bannerImage;

  await user.save();

  return ApiResponse.success(res, {
    message: 'Profile updated successfully',
    data: { user: user.toPublicProfile() },
  });
});

const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user ? req.user._id : null;

  const targetUser = await User.findOne({ username });
  if (!targetUser) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  // Check visibility of the profile itself
  if (targetUser.profileVisibility === 'PRIVATE' && (!currentUserId || currentUserId.toString() !== targetUser._id.toString())) {
    throw new AppError('This profile is private', HTTP_STATUS.FORBIDDEN);
  }

  let isFollowing = false;
  if (targetUser.profileVisibility === 'FOLLOWERS_ONLY') {
    if (!currentUserId) throw new AppError('This profile is for followers only', HTTP_STATUS.FORBIDDEN);
    if (currentUserId.toString() !== targetUser._id.toString()) {
      const follow = await Follow.findOne({ follower: currentUserId, following: targetUser._id });
      if (!follow) throw new AppError('This profile is for followers only', HTTP_STATUS.FORBIDDEN);
      isFollowing = true;
    }
  }

  // Build query for posts
  const query = { author: targetUser._id };

  // Adjust query based on relation
  if (!currentUserId || currentUserId.toString() !== targetUser._id.toString()) {
    if (!isFollowing) {
      const follow = await Follow.findOne({ follower: currentUserId, following: targetUser._id });
      isFollowing = !!follow;
    }

    if (isFollowing) {
      query.visibility = { $in: ['PUBLIC', 'FOLLOWERS'] };
    } else {
      query.visibility = 'PUBLIC';
    }
  }

  const { cursor, limit = 10 } = req.query;
  const parsedLimit = parseInt(limit, 10);

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(parsedLimit + 1)
    .populate('author', 'name username avatar')
    .populate('bookRef', 'title author coverImage')
    .lean();

  const hasNextPage = posts.length > parsedLimit;
  const userPosts = hasNextPage ? posts.slice(0, -1) : posts;
  const nextCursor = hasNextPage ? userPosts[userPosts.length - 1].createdAt : null;

  // Augment with user interaction state (liked, saved)
  let augmentedPosts = userPosts;
  if (currentUserId) {
    const postIds = userPosts.map(p => p._id);
    const [userLikes, userSaves] = await Promise.all([
      Like.find({ user: currentUserId, post: { $in: postIds } }),
      SavedPost.find({ user: currentUserId, post: { $in: postIds } })
    ]);

    const likedPostIds = new Set(userLikes.map(l => l.post.toString()));
    const savedPostIds = new Set(userSaves.map(s => s.post.toString()));

    augmentedPosts = userPosts.map(post => ({
      ...post,
      isLiked: likedPostIds.has(post._id.toString()),
      isSaved: savedPostIds.has(post._id.toString())
    }));
  } else {
    augmentedPosts = userPosts.map(post => ({
      ...post,
      isLiked: false,
      isSaved: false
    }));
  }

  return ApiResponse.success(res, {
    message: 'User posts retrieved',
    data: {
      posts: augmentedPosts,
      nextCursor,
      hasNextPage
    }
  });
});

const getUserLibrary = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user ? req.user._id : null;

  const targetUser = await User.findOne({ username });
  if (!targetUser) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  // Check visibility of the profile itself
  if (targetUser.profileVisibility === 'PRIVATE' && (!currentUserId || currentUserId.toString() !== targetUser._id.toString())) {
    throw new AppError('This profile is private', HTTP_STATUS.FORBIDDEN);
  }

  if (targetUser.profileVisibility === 'FOLLOWERS_ONLY') {
    if (!currentUserId) throw new AppError('This profile is for followers only', HTTP_STATUS.FORBIDDEN);
    if (currentUserId.toString() !== targetUser._id.toString()) {
      const follow = await Follow.findOne({ follower: currentUserId, following: targetUser._id });
      if (!follow) throw new AppError('This profile is for followers only', HTTP_STATUS.FORBIDDEN);
    }
  }

  // Get library entries for targetUser
  const { entries, meta } = await libraryService.getLibraryEntries(targetUser._id, req.query);

  return ApiResponse.success(res, {
    message: 'User library retrieved successfully',
    data: { entries },
    meta
  });
});

module.exports = {
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getActivities,
  updateProfile,
  getUserPosts,
  getUserLibrary,
};
