const mongoose = require('mongoose');

const chapterRatingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chapter title is required'],
    trim: true,
    maxlength: [150, 'Chapter title cannot exceed 150 characters'],
  },
  content: {
    type: String,
    required: [true, 'Chapter content is required'],
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED'],
    default: 'PUBLISHED',
  },
  chapterNumber: {
    type: Number,
    default: 1,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  ratings: [chapterRatingSchema],
  averageRating: {
    type: Number,
    default: 5.0,
  },
  ratingsCount: {
    type: Number,
    default: 0,
  },
}, { _id: true, timestamps: true });

const workSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true,
  },
  contentType: {
    type: String,
    enum: ['STORY', 'POEM', 'BLOG', 'DIARY'],
    default: 'STORY',
    required: true,
  },
  language: {
    type: String,
    default: 'English',
    enum: ['English', 'Hindi', 'Hinglish'],
  },
  genre: {
    type: String,
    trim: true,
    default: 'General',
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [1000, 'Summary cannot exceed 1000 characters'],
  },
  coverImage: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED'],
    default: 'PUBLISHED',
  },
  visibility: {
    type: String,
    enum: ['PUBLIC', 'FOLLOWERS', 'PRIVATE'],
    default: 'PUBLIC',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  chapters: [chapterSchema],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  stats: {
    views: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    readsCount: { type: Number, default: 0 },
    totalWordCount: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Auto calculate total word count before save
workSchema.pre('save', function () {
  try {
    if (!this.stats) {
      this.stats = { views: 0, likesCount: 0, readsCount: 0, totalWordCount: 0 };
    }
    if (this.chapters && Array.isArray(this.chapters) && this.chapters.length > 0) {
      let total = 0;
      for (const ch of this.chapters) {
        const words = ch.content ? ch.content.trim().split(/\s+/).filter(Boolean).length : 0;
        ch.wordCount = words;
        total += words;
      }
      this.stats.totalWordCount = total;
    } else {
      this.stats.totalWordCount = 0;
    }
    this.stats.likesCount = Array.isArray(this.likes) ? this.likes.length : 0;
  } catch (err) {
    console.error('Error in Work pre-save hook:', err);
  }
});

workSchema.index({ contentType: 1, status: 1, visibility: 1, createdAt: -1 });

module.exports = mongoose.model('Work', workSchema);
