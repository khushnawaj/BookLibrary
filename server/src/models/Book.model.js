const mongoose = require('mongoose');

const purchaseLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform name is required'],
      trim: true,
      maxlength: [50, 'Platform name cannot exceed 50 characters'],
    },
    url: {
      type: String,
      required: [true, 'Purchase URL is required'],
      trim: true,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
  },
  { _id: false }
);

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [200, 'Author name cannot exceed 200 characters'],
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: [200, 'Publisher name cannot exceed 200 characters'],
      default: '',
    },
    publicationDate: {
      type: Date,
      validate: {
        validator(value) {
          if (!value) return true;
          return value <= new Date();
        },
        message: 'Publication date cannot be in the future',
      },
    },
    isbn: {
      type: String,
      trim: true,
      match: [/^(?:\d[- ]?){13}$|^(?:\d[- ]?){10}$|^[\dX-]{10,17}$/i, 'Please provide a valid ISBN'],
    },
    genre: {
      type: String,
      trim: true,
      maxlength: [100, 'Genre cannot exceed 100 characters'],
      default: '',
    },
    language: {
      type: String,
      trim: true,
      maxlength: [50, 'Language cannot exceed 50 characters'],
      // default: 'English',
    },
    pages: {
      type: Number,
      min: [1, 'Pages must be at least 1'],
      max: [50000, 'Pages cannot exceed 50000'],
    },
    coverImage: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    purchaseLinks: {
      type: [purchaseLinkSchema],
      default: [],
      validate: {
        validator(links) {
          return links.length <= 10;
        },
        message: 'Cannot have more than 10 purchase links',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Book owner is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookSchema.index({ title: 'text', author: 'text', genre: 'text' });
bookSchema.index({ owner: 1, createdAt: -1 });
bookSchema.index({ isbn: 1 }, { unique: true, sparse: true });
bookSchema.index({ genre: 1 });
bookSchema.index({ author: 1 });

bookSchema.virtual('ownerProfile', {
  ref: 'User',
  localField: 'owner',
  foreignField: '_id',
  justOne: true,
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
