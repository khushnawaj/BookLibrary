const mongoose = require('mongoose');

const importHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    totalRecords: {
      type: Number,
      required: true,
      default: 0,
    },
    importedRecords: {
      type: Number,
      required: true,
      default: 0,
    },
    skippedRecords: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ImportHistory', importHistorySchema);
