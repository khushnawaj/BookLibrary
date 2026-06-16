const mongoose = require('mongoose');
const { SHELF_TYPES } = require('../constants');

const librarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
      index: true,
    },
    shelfType: {
      type: String,
      enum: {
        values: Object.values(SHELF_TYPES),
        message: 'Invalid shelf type',
      },
      required: [true, 'Shelf type is required'],
      default: SHELF_TYPES.WISHLIST,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: null,
    },
    review: {
      type: String,
      trim: true,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
      validate: {
        validator(value) {
          if (!value || !this.startedAt) return true;
          return value >= this.startedAt;
        },
        message: 'Finished date must be after started date',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

librarySchema.index({ user: 1, book: 1 }, { unique: true });
librarySchema.index({ user: 1, shelfType: 1 });
librarySchema.index({ user: 1, shelfType: 1, updatedAt: -1 });
librarySchema.index({ book: 1, rating: 1 });

librarySchema.virtual('readingDurationDays').get(function readingDurationDays() {
  if (!this.startedAt || !this.finishedAt) return null;
  const diffMs = this.finishedAt.getTime() - this.startedAt.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

librarySchema.virtual('bookDetails', {
  ref: 'Book',
  localField: 'book',
  foreignField: '_id',
  justOne: true,
});

librarySchema.virtual('userProfile', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

librarySchema.pre('save', function syncReadingDates() {
  if (this.shelfType === SHELF_TYPES.READING && !this.startedAt) {
    this.startedAt = new Date();
  }

  if (this.shelfType === SHELF_TYPES.READ && !this.finishedAt) {
    this.finishedAt = new Date();
  }
});

const Library = mongoose.model('Library', librarySchema);

module.exports = Library;
