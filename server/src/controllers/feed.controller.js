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

  // Replace lines 16-29 with an OR clause:
  if (type === 'following') {
    const follows = await Follow.find({ follower: userId }).select('following');
    const followingIds = follows.map((f) => f.following);
    followingIds.push(userId);

    query.$or = [
      { author: { $in: followingIds }, visibility: { $in: ['PUBLIC', 'FOLLOWERS'] } },
      { author: userId, visibility: 'PRIVATE' }
    ];
  } else {
    query.$or = [
      { visibility: { $in: ['PUBLIC', 'FOLLOWERS'] } },
      { author: userId, visibility: 'PRIVATE' }
    ];
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
