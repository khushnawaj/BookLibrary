const { WritingTracker, WritingLog, Work } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { HTTP_STATUS, TRACKER_STATUS } = require('../constants');
const {
  formatTrackerSummary,
  calculateStreak,
  get30DayWordStats,
  ACTIVE_STATUSES,
} = require('../services/tracker.service');

// @desc    Get user's writing project trackers with filtering & sorting
// @route   GET /api/v1/tracker
// @access  Private
exports.getTrackers = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { status, contentType, neglected, search, sort = 'lastWorkedAt', isArchived } = req.query;

    const query = { user: userId };

    if (isArchived === 'true') {
      query.isArchived = true;
    } else if (isArchived !== 'all') {
      query.isArchived = false;
    }

    if (status && status !== 'ALL') {
      query.trackerStatus = status;
    }

    if (contentType && contentType !== 'ALL') {
      query.contentType = contentType;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { whereILeftOff: { $regex: search.trim(), $options: 'i' } },
        { nextAction: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sort order
    let sortOption = { lastWorkedAt: -1 };
    if (sort === 'createdAt') sortOption = { createdAt: -1 };
    if (sort === 'title') sortOption = { title: 1 };
    if (sort === 'priority') sortOption = { priority: -1, lastWorkedAt: -1 };

    const trackers = await WritingTracker.find(query)
      .populate('work')
      .sort(sortOption);

    let formattedTrackers = trackers.map(formatTrackerSummary);

    // Filter by neglected flag if requested
    if (neglected === 'true') {
      formattedTrackers = formattedTrackers.filter((t) => t.isNeglected);
    }

    return ApiResponse.success(res, {
      message: 'Trackers fetched successfully',
      data: formattedTrackers,
    });
  } catch (error) {
    console.error('Error fetching trackers:', error);
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER,
      message: error.message || 'Failed to fetch writing trackers',
    });
  }
};

// @desc    Get user's unlinked Works for 1-click import
// @route   GET /api/v1/tracker/unlinked-works
// @access  Private
exports.getUnlinkedWorks = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Get existing tracked work IDs
    const existingTrackers = await WritingTracker.find({
      user: userId,
      work: { $ne: null },
    }).select('work');

    const trackedWorkIds = existingTrackers
      .map((t) => t.work ? t.work.toString() : null)
      .filter(Boolean);

    // Find works not yet tracked
    const unlinkedWorks = await Work.find({
      author: userId,
      _id: { $nin: trackedWorkIds },
    }).sort({ updatedAt: -1 });

    return ApiResponse.success(res, {
      message: 'Unlinked works fetched successfully',
      data: unlinkedWorks,
    });
  } catch (error) {
    console.error('Error fetching unlinked works:', error);
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER,
      message: error.message || 'Failed to fetch unlinked works',
    });
  }
};

// @desc    Get aggregated writing tracker statistics & streak
// @route   GET /api/v1/tracker/stats
// @access  Private
exports.getTrackerStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const trackers = await WritingTracker.find({ user: userId, isArchived: false }).populate('work');
    const formatted = trackers.map(formatTrackerSummary);

    // Status counts
    const statusCounts = {
      [TRACKER_STATUS.IDEA]: 0,
      [TRACKER_STATUS.OUTLINING]: 0,
      [TRACKER_STATUS.DRAFTING]: 0,
      [TRACKER_STATUS.EDITING]: 0,
      [TRACKER_STATUS.COMPLETED]: 0,
      [TRACKER_STATUS.ON_HOLD]: 0,
      [TRACKER_STATUS.ABANDONED]: 0,
    };

    let activeCount = 0;
    let neglectedCount = 0;
    let totalWordsWritten = 0;

    formatted.forEach((t) => {
      if (statusCounts[t.trackerStatus] !== undefined) {
        statusCounts[t.trackerStatus]++;
      }
      if (ACTIVE_STATUSES.includes(t.trackerStatus)) {
        activeCount++;
      }
      if (t.isNeglected) {
        neglectedCount++;
      }
      totalWordsWritten += t.counts?.totalWordCount || 0;
    });

    const streak = await calculateStreak(userId);
    const dailyStats = await get30DayWordStats(userId);

    return ApiResponse.success(res, {
      message: 'Tracker stats fetched successfully',
      data: {
        totalTrackers: trackers.length,
        activeCount,
        neglectedCount,
        totalWordsWritten,
        statusCounts,
        streak,
        dailyStats,
      },
    });
  } catch (error) {
    console.error('Error fetching tracker stats:', error);
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER,
      message: error.message || 'Failed to fetch tracker stats',
    });
  }
};

// @desc    Create a new writing project tracker (linked or external)
// @route   POST /api/v1/tracker
// @access  Private
exports.createTracker = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      workId,
      title,
      contentType,
      genre,
      language,
      trackerStatus,
      plannedChapters,
      externalCounts,
      whereILeftOff,
      nextAction,
      priority,
    } = req.body;

    let workRef = null;

    if (workId) {
      const work = await Work.findById(workId);
      if (!work) {
        return ApiResponse.error(res, {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Work not found',
        });
      }
      if (work.author.toString() !== userId.toString()) {
        return ApiResponse.error(res, {
          statusCode: HTTP_STATUS.FORBIDDEN,
          message: 'You can only link your own works',
        });
      }

      // Check duplicate
      const existing = await WritingTracker.findOne({ user: userId, work: workId });
      if (existing) {
        return ApiResponse.error(res, {
          statusCode: HTTP_STATUS.CONFLICT,
          message: 'This manuscript is already linked to a writing tracker',
        });
      }
      workRef = work._id;
    } else {
      if (!title || !title.trim()) {
        return ApiResponse.error(res, {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: 'Title is required for external writing projects',
        });
      }
    }

    const tracker = await WritingTracker.create({
      user: userId,
      work: workRef,
      title: title ? title.trim() : undefined,
      contentType: contentType || 'NOVEL',
      genre: genre ? genre.trim() : 'General',
      language: language ? language.trim() : 'English',
      trackerStatus: trackerStatus || 'DRAFTING',
      plannedChapters: plannedChapters ? parseInt(plannedChapters) : null,
      externalCounts: externalCounts || { drafted: 0, edited: 0, published: 0 },
      whereILeftOff: whereILeftOff ? whereILeftOff.trim() : '',
      nextAction: nextAction ? nextAction.trim() : '',
      priority: priority ? parseInt(priority) : 1,
      lastWorkedAt: new Date(),
    });

    const populatedTracker = await WritingTracker.findById(tracker._id).populate('work');
    const formatted = formatTrackerSummary(populatedTracker);

    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Writing tracker created successfully',
      data: formatted,
    });
  } catch (error) {
    console.error('Error creating tracker:', error);
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER,
      message: error.message || 'Failed to create writing tracker',
    });
  }
};

// @desc    Get single writing tracker detail with derived breakdown & logs
// @route   GET /api/v1/tracker/:id
// @access  Private
exports.getTrackerById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const tracker = await WritingTracker.findById(req.params.id).populate('work');

    if (!tracker) {
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'Writing tracker not found',
      });
    }

    if (tracker.user.toString() !== userId.toString()) {
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: 'Not authorized to view this tracker',
      });
    }

    const logs = await WritingLog.find({ tracker: tracker._id })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    const formatted = formatTrackerSummary(tracker);

    return ApiResponse.success(res, {
      message: 'Tracker detail fetched successfully',
      data: {
        ...formatted,
        logs,
      },
    });
  } catch (error) {
    console.error('Error fetching tracker by ID:', error);
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER,
      message: error.message || 'Failed to fetch tracker details',
    });
  }
};

// @desc    Update a writing tracker
// @route   PATCH /api/v1/tracker/:id
// @access  Private
exports.updateTracker = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const tracker = await WritingTracker.findById(req.params.id);

    if (!tracker) {
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'Writing tracker not found',
      });
    }

    if (tracker.user.toString() !== userId.toString()) {
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: 'Not authorized to update this tracker',
      });
    }

    const {
      title,
      contentType,
      genre,
      language,
      trackerStatus,
      plannedChapters,
      externalCounts,
      publications,
      whereILeftOff,
      nextAction,
      priority,
      isArchived,
      lastWorkedAt,
    } = req.body;

    if (title !== undefined) tracker.title = title.trim();
    if (contentType !== undefined) tracker.contentType = contentType;
    if (genre !== undefined) tracker.genre = genre.trim();
    if (language !== undefined) tracker.language = language.trim();
    if (trackerStatus !== undefined) tracker.trackerStatus = trackerStatus;
    if (plannedChapters !== undefined) tracker.plannedChapters = plannedChapters;
    if (externalCounts !== undefined) tracker.externalCounts = externalCounts;
    if (publications !== undefined) tracker.publications = publications;
    if (whereILeftOff !== undefined) tracker.whereILeftOff = whereILeftOff.trim();
    if (nextAction !== undefined) tracker.nextAction = nextAction.trim();
    if (priority !== undefined) tracker.priority = priority;
    if (isArchived !== undefined) tracker.isArchived = isArchived;
    if (lastWorkedAt !== undefined) tracker.lastWorkedAt = new Date(lastWorkedAt);

    await tracker.save();

    const updatedTracker = await WritingTracker.findById(tracker._id).populate('work');
    const formatted = formatTrackerSummary(updatedTracker);

    return ApiResponse.success(res, {
      message: 'Writing tracker updated successfully',
      data: formatted,
    });
  } catch (error) {
    console.error('Error updating tracker:', error);
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER,
      message: error.message || 'Failed to update writing tracker',
    });
  }
};

// @desc    Delete a writing tracker & associated logs
// @route   DELETE /api/v1/tracker/:id
// @access  Private
exports.deleteTracker = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const tracker = await WritingTracker.findById(req.params.id);

    if (!tracker) {
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'Writing tracker not found',
      });
    }

    if (tracker.user.toString() !== userId.toString()) {
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: 'Not authorized to delete this tracker',
      });
    }

    await tracker.deleteOne();
    await WritingLog.deleteMany({ tracker: req.params.id });

    return ApiResponse.success(res, {
      message: 'Writing tracker and associated logs deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error('Error deleting tracker:', error);
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER,
      message: error.message || 'Failed to delete writing tracker',
    });
  }
};

// @desc    Add a writing session log entry to a tracker
// @route   POST /api/v1/tracker/:id/log
// @access  Private
exports.addWritingLog = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const tracker = await WritingTracker.findById(req.params.id);

    if (!tracker) {
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'Writing tracker not found',
      });
    }

    if (tracker.user.toString() !== userId.toString()) {
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: 'Not authorized to log progress for this tracker',
      });
    }

    const { wordsWritten, note, date } = req.body;
    const parsedWords = parseInt(wordsWritten);

    if (isNaN(parsedWords) || parsedWords < 0) {
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'Valid words written count is required',
      });
    }

    const logDate = date ? new Date(date) : new Date();

    const log = await WritingLog.create({
      user: userId,
      tracker: tracker._id,
      date: logDate,
      wordsWritten: parsedWords,
      note: note ? note.trim() : '',
    });

    // Update tracker lastWorkedAt
    tracker.lastWorkedAt = logDate;
    await tracker.save();

    const updatedTracker = await WritingTracker.findById(tracker._id).populate('work');
    const formatted = formatTrackerSummary(updatedTracker);

    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Writing session logged successfully',
      data: {
        log,
        tracker: formatted,
      },
    });
  } catch (error) {
    console.error('Error adding writing log:', error);
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER,
      message: error.message || 'Failed to log writing progress',
    });
  }
};
