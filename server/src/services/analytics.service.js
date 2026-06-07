const { Book, Library, Goal, Achievement } = require('../models');
const { SHELF_TYPES, GOAL_STATUS } = require('../constants');
const mongoose = require('mongoose');

// Badge definitions
const BADGES = [
  { id: 'first_book', title: 'First Book', description: 'Read your first book', icon: '📚', criteria: (stats) => stats.totalRead >= 1 },
  { id: '10_books', title: 'Avid Reader', description: 'Read 10 books', icon: '🥉', criteria: (stats) => stats.totalRead >= 10 },
  { id: '25_books', title: 'Bookworm', description: 'Read 25 books', icon: '🥈', criteria: (stats) => stats.totalRead >= 25 },
  { id: '50_books', title: 'Bibliophile', description: 'Read 50 books', icon: '🥇', criteria: (stats) => stats.totalRead >= 50 },
  { id: '100_books', title: 'Library Master', description: 'Read 100 books', icon: '👑', criteria: (stats) => stats.totalRead >= 100 },
  { id: '1000_pages', title: 'Page Turner', description: 'Read 1,000 pages', icon: '📄', criteria: (stats) => stats.totalPages >= 1000 },
  { id: 'streak_7', title: 'Weekly Warrior', description: 'Read for 7 consecutive days', icon: '🔥', criteria: (stats) => stats.currentStreak >= 7 },
  { id: 'streak_30', title: 'Monthly Master', description: 'Read for 30 consecutive days', icon: '⭐', criteria: (stats) => stats.currentStreak >= 30 },
];

const calculateReadingStreak = async (userId) => {
  const readBooks = await Library.find({ user: userId, shelfType: SHELF_TYPES.READ, finishedAt: { $ne: null } })
    .sort({ finishedAt: -1 })
    .select('finishedAt');

  if (readBooks.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const dates = readBooks.map(b => new Date(b.finishedAt).setHours(0, 0, 0, 0));
  const uniqueDates = [...new Set(dates)].sort((a, b) => b - a); // descending

  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 86400000;

  // Check current streak
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      if (uniqueDates[i] - uniqueDates[i+1] === 86400000) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  // Check longest streak
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    if (uniqueDates[i] - uniqueDates[i+1] === 86400000) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, longestStreak };
};

const getReadingAnalytics = async (userId) => {
  const objectIdUser = new mongoose.Types.ObjectId(userId);

  const [basicStats, genreDist, monthlyBooks] = await Promise.all([
    Library.aggregate([
      { $match: { user: objectIdUser, shelfType: SHELF_TYPES.READ } },
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      { $unwind: '$bookDetails' },
      {
        $group: {
          _id: null,
          totalRead: { $sum: 1 },
          totalPages: { $sum: '$bookDetails.pages' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]),
    Library.aggregate([
      { $match: { user: objectIdUser, shelfType: SHELF_TYPES.READ } },
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      { $unwind: '$bookDetails' },
      { $match: { 'bookDetails.genre': { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$bookDetails.genre',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]),
    Library.aggregate([
      { $match: { user: objectIdUser, shelfType: SHELF_TYPES.READ, finishedAt: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$finishedAt' } },
          booksCount: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const stats = basicStats[0] || { totalRead: 0, totalPages: 0, avgRating: 0 };
  const streaks = await calculateReadingStreak(userId);

  // Check achievements
  const allStats = { ...stats, currentStreak: streaks.currentStreak };
  await checkAchievements(userId, allStats);

  // Return formatted data
  return {
    overview: {
      totalBooksRead: stats.totalRead,
      totalPagesRead: stats.totalPages || 0,
      averageRating: stats.avgRating ? Number(stats.avgRating.toFixed(1)) : 0,
      ...streaks
    },
    genreDistribution: genreDist.map(g => ({ name: g._id, value: g.count })),
    booksPerMonth: monthlyBooks.map(m => ({ month: m._id, count: m.booksCount }))
  };
};

const checkAchievements = async (userId, stats) => {
  const earnedBadges = await Achievement.find({ user: userId }).select('badgeId');
  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));

  for (const badge of BADGES) {
    if (!earnedBadgeIds.has(badge.id) && badge.criteria(stats)) {
      await Achievement.create({
        user: userId,
        badgeId: badge.id,
        title: badge.title,
        description: badge.description,
        icon: badge.icon
      });
    }
  }
};

const getAchievements = async (userId) => {
  return Achievement.find({ user: userId }).sort({ earnedAt: -1 });
};

// Goals
const createGoal = async (userId, goalData) => {
  return Goal.create({ ...goalData, user: userId });
};

const getGoals = async (userId) => {
  // Auto-update progress before returning
  const goals = await Goal.find({ user: userId }).sort({ createdAt: -1 });
  const objectIdUser = new mongoose.Types.ObjectId(userId);
  
  for (let goal of goals) {
    if (goal.status === GOAL_STATUS.ACTIVE) {
      // Calculate current value
      let matchQuery = { user: objectIdUser, shelfType: SHELF_TYPES.READ, finishedAt: { $gte: goal.startDate, $lte: goal.endDate } };
      let currentVal = 0;

      if (goal.targetType === 'BOOKS') {
        currentVal = await Library.countDocuments(matchQuery);
      } else if (goal.targetType === 'PAGES') {
        const pagesRes = await Library.aggregate([
          { $match: matchQuery },
          { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'b' } },
          { $unwind: '$b' },
          { $group: { _id: null, total: { $sum: '$b.pages' } } }
        ]);
        currentVal = pagesRes[0]?.total || 0;
      }

      goal.currentValue = currentVal;
      if (currentVal >= goal.targetValue) {
        goal.status = GOAL_STATUS.COMPLETED;
      } else if (new Date() > goal.endDate) {
        goal.status = GOAL_STATUS.FAILED;
      }
      await goal.save();
    }
  }

  return goals;
};

const deleteGoal = async (userId, goalId) => {
  return Goal.findOneAndDelete({ _id: goalId, user: userId });
};

module.exports = {
  getReadingAnalytics,
  getAchievements,
  createGoal,
  getGoals,
  deleteGoal
};
