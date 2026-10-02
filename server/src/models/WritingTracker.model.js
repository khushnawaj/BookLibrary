const mongoose = require('mongoose');
const { TRACKER_STATUS, TRACKER_CONTENT_TYPE } = require('../constants');

const publicationSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    episodesPublished: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPublishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true, timestamps: true }
);

const writingTrackerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    work: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work',
      default: null,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    contentType: {
      type: String,
      enum: Object.values(TRACKER_CONTENT_TYPE),
      default: TRACKER_CONTENT_TYPE.NOVEL,
    },
    genre: {
      type: String,
      trim: true,
      default: 'General',
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    language: {
      type: String,
      trim: true,
      default: 'English',
    },
    trackerStatus: {
      type: String,
      enum: Object.values(TRACKER_STATUS),
      default: TRACKER_STATUS.DRAFTING,
      index: true,
    },
    plannedChapters: {
      type: Number,
      default: null,
      min: 0,
    },
    externalCounts: {
      drafted: { type: Number, default: 0, min: 0 },
      edited: { type: Number, default: 0, min: 0 },
      published: { type: Number, default: 0, min: 0 },
    },
    publications: [publicationSchema],
    whereILeftOff: {
      type: String,
      trim: true,
      default: '',
      maxlength: 2000,
    },
    nextAction: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    lastWorkedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    priority: {
      type: Number,
      default: 1,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure unique link between user and work when work is provided
writingTrackerSchema.index(
  { user: 1, work: 1 },
  {
    unique: true,
    partialFilterExpression: { work: { $type: 'objectId' } },
  }
);

writingTrackerSchema.index({ user: 1, trackerStatus: 1, lastWorkedAt: -1 });

module.exports = mongoose.model('WritingTracker', writingTrackerSchema);
