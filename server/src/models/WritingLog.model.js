const mongoose = require('mongoose');

const writingLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tracker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WritingTracker',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    wordsWritten: {
      type: Number,
      required: [true, 'Words written is required'],
      min: [0, 'Words written cannot be negative'],
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

writingLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('WritingLog', writingLogSchema);
