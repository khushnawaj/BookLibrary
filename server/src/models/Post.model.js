const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    images: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['PUBLIC', 'FOLLOWERS', 'PRIVATE'],
      default: 'PUBLIC',
      index: true,
    },
    hashtags: {
      type: [String],
      default: [],
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    // Optional references to external items (books, achievements, etc.)
    bookRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
    activityRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for feed generation
postSchema.index({ createdAt: -1 });
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
