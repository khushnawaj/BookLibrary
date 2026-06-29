const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['SUGGESTION', 'FEEDBACK', 'HELP', 'SUPPORT'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['PENDING', 'RESOLVED'],
      default: 'PENDING',
    },
    adminResponse: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ status: 1, type: 1 });
feedbackSchema.index({ user: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
