const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { Post, Like, Comment, SavedPost, Follow } = require('../models');
const { HTTP_STATUS } = require('../constants');

// =====================================
// POST CRUD
// =====================================

const createPost = asyncHandler(async (req, res) => {
  const { content, images, visibility, hashtags, bookRef, activityRef } = req.body;

  const post = await Post.create({
    author: req.user._id,
    content,
    images: images || [],
    visibility: visibility || 'PUBLIC',
    hashtags: hashtags || [],
    bookRef: bookRef || undefined,
    activityRef: activityRef || undefined,
  });

  const populatedPost = await Post.findById(post._id).populate('author', 'name username avatar');

  return ApiResponse.success(res, {
    message: 'Post created successfully',
    data: populatedPost,
  }, HTTP_STATUS.CREATED);
});

const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id)
    .populate('author', 'name username avatar')
    .populate('bookRef')
    .populate('activityRef');

  if (!post) {
    throw new AppError('Post not found', HTTP_STATUS.NOT_FOUND);
  }

  // Check visibility if not author
  if (post.author._id.toString() !== req.user._id.toString()) {
    if (post.visibility === 'PRIVATE') {
      throw new AppError('This post is private', HTTP_STATUS.FORBIDDEN);
    }
    if (post.visibility === 'FOLLOWERS') {
      const isFollowing = await Follow.findOne({ follower: req.user._id, following: post.author._id });
      if (!isFollowing) throw new AppError('This post is visible to followers only', HTTP_STATUS.FORBIDDEN);
    }
  }

  return ApiResponse.success(res, {
    message: 'Post retrieved',
    data: post,
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findOneAndDelete({ _id: id, author: req.user._id });
  
  if (!post) {
    throw new AppError('Post not found or unauthorized', HTTP_STATUS.NOT_FOUND);
  }

  // Cleanup references
  await Promise.all([
    Like.deleteMany({ post: id }),
    Comment.deleteMany({ post: id }),
    SavedPost.deleteMany({ post: id })
  ]);

  return ApiResponse.success(res, { message: 'Post deleted successfully' });
});

// =====================================
// LIKES
// =====================================

const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const existingLike = await Like.findOne({ user: userId, post: id });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    await Post.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
    return ApiResponse.success(res, { message: 'Post unliked', data: { liked: false } });
  } else {
    await Like.create({ user: userId, post: id });
    await Post.findByIdAndUpdate(id, { $inc: { likesCount: 1 } });
    return ApiResponse.success(res, { message: 'Post liked', data: { liked: true } });
  }
});

// =====================================
// COMMENTS
// =====================================

const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, parentComment } = req.body;

  const comment = await Comment.create({
    user: req.user._id,
    post: id,
    content,
    parentComment: parentComment || null,
  });

  await Post.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });

  const populatedComment = await Comment.findById(comment._id).populate('user', 'name username avatar');

  return ApiResponse.success(res, { message: 'Comment added', data: populatedComment }, HTTP_STATUS.CREATED);
});

const getComments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const comments = await Comment.find({ post: id })
    .populate('user', 'name username avatar')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, { message: 'Comments retrieved', data: comments });
});

const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;

  const comment = await Comment.findOneAndDelete({ _id: commentId, user: req.user._id, post: id });
  if (!comment) throw new AppError('Comment not found or unauthorized', HTTP_STATUS.NOT_FOUND);

  await Post.findByIdAndUpdate(id, { $inc: { commentsCount: -1 } });
  
  // optionally delete nested replies here

  return ApiResponse.success(res, { message: 'Comment deleted' });
});

// =====================================
// SAVED POSTS
// =====================================

const toggleSavePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const existingSave = await SavedPost.findOne({ user: userId, post: id });

  if (existingSave) {
    await SavedPost.findByIdAndDelete(existingSave._id);
    return ApiResponse.success(res, { message: 'Post unsaved', data: { saved: false } });
  } else {
    await SavedPost.create({ user: userId, post: id });
    return ApiResponse.success(res, { message: 'Post saved', data: { saved: true } });
  }
});

module.exports = {
  createPost,
  getPostById,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
  toggleSavePost,
};
