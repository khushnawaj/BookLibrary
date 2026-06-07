const mongoose = require('mongoose');

const ACTIVITY_TYPES = {
  BOOK_ADDED: 'BOOK_ADDED',
  BOOK_COMPLETED: 'BOOK_COMPLETED',
  BOOK_RATED: 'BOOK_RATED',
  BOOK_REVIEWED: 'BOOK_REVIEWED',
  BADGE_UNLOCKED: 'BADGE_UNLOCKED',
};

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ACTIVITY_TYPES),
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);
module.exports.ACTIVITY_TYPES = ACTIVITY_TYPES;
