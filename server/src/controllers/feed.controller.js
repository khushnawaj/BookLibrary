const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { Post, Follow, Like, SavedPost } = require('../models');

const getFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { cursor, limit = 10, type = 'global' } = req.query; // type: 'following' | 'global'

  const parsedLimit = parseInt(limit, 10);
  const query = {};

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  if (type === 'following') {
    // Get list of followed users
    const follows = await Follow.find({ follower: userId }).select('following');
    const followingIds = follows.map((f) => f.following);

    // Include user's own posts + following
    followingIds.push(userId);

    query.author = { $in: followingIds };
    query.visibility = { $in: ['PUBLIC', 'FOLLOWERS'] };
  } else {
    // Global / community feed — show all public posts
    query.visibility = { $in: ['PUBLIC', 'FOLLOWERS'] };
  }

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(parsedLimit + 1)
    .populate('author', 'name username avatar')
    .populate('bookRef', 'title author coverImage')
    .lean();

  const hasNextPage = posts.length > parsedLimit;
  const feedPosts = hasNextPage ? posts.slice(0, -1) : posts;
  const nextCursor = hasNextPage ? feedPosts[feedPosts.length - 1].createdAt : null;

  // Augment with user interaction state (liked, saved)
  const postIds = feedPosts.map(p => p._id);
  const [userLikes, userSaves] = await Promise.all([
    Like.find({ user: userId, post: { $in: postIds } }),
    SavedPost.find({ user: userId, post: { $in: postIds } })
  ]);

  const likedPostIds = new Set(userLikes.map(l => l.post.toString()));
  const savedPostIds = new Set(userSaves.map(s => s.post.toString()));

  const augmentedPosts = feedPosts.map(post => ({
    ...post,
    isLiked: likedPostIds.has(post._id.toString()),
    isSaved: savedPostIds.has(post._id.toString())
  }));

  return ApiResponse.success(res, {
    message: 'Feed retrieved',
    data: {
      posts: augmentedPosts,
      nextCursor,
      hasNextPage
    }
  });
});

module.exports = {
  getFeed,
};
