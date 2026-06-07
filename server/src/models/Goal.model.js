const mongoose = require('mongoose');
const { GOAL_TYPES, GOAL_STATUS } = require('../constants');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    targetType: {
      type: String,
      enum: Object.values(GOAL_TYPES),
      required: true,
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
      min: [1, 'Target must be at least 1'],
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(GOAL_STATUS),
      default: GOAL_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.virtual('progressPercentage').get(function () {
  if (this.targetValue === 0) return 0;
  return Math.min(100, Math.round((this.currentValue / this.targetValue) * 100));
});

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
