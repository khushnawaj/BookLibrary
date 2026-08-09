const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { Post, Follow, Like, SavedPost } = require('../models');

const getFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { cursor, limit = 10, type = 'global', visibility } = req.query; // type: 'following' | 'global', visibility: 'ALL' | 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'

  const parsedLimit = parseInt(limit, 10);

  // Fetch IDs of users the current user follows
  const follows = await Follow.find({ follower: userId }).select('following');
  const followingIds = follows.map((f) => f.following);

  const query = {};

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  // Handle explicit visibility filters first if provided
  if (visibility && visibility !== 'ALL') {
    if (visibility === 'PRIVATE') {
      // ONLY current user's own private posts
      query.author = userId;
      query.visibility = 'PRIVATE';
    } else if (visibility === 'FOLLOWERS') {
      // Followers posts from users I follow + my own followers posts
      query.$or = [
        { author: { $in: followingIds }, visibility: 'FOLLOWERS' },
        { author: userId, visibility: 'FOLLOWERS' }
      ];
    } else if (visibility === 'PUBLIC') {
      // All public posts
      query.visibility = 'PUBLIC';
    }
  } else {
    // Default 'ALL' visibility mode:
    if (type === 'following') {
      // Following feed: Posts from people I follow (PUBLIC or FOLLOWERS) + my own posts
      query.$or = [
        { author: { $in: followingIds }, visibility: { $in: ['PUBLIC', 'FOLLOWERS'] } },
        { author: userId }
      ];
    } else {
      // Global feed: PUBLIC posts + FOLLOWERS posts from people I follow + my own posts
      query.$or = [
        { visibility: 'PUBLIC' },
        { author: { $in: followingIds }, visibility: 'FOLLOWERS' },
        { author: userId }
      ];
    }
  }

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(parsedLimit + 1)
    .populate('author', 'name username avatar penName')
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
