const { WritingTracker, WritingLog, Work } = require('../models');
const { TRACKER_STATUS } = require('../constants');

const ACTIVE_STATUSES = [
  TRACKER_STATUS.IDEA,
  TRACKER_STATUS.OUTLINING,
  TRACKER_STATUS.DRAFTING,
  TRACKER_STATUS.EDITING,
];

const NEGLECT_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Format and derive tracker summary data (linked Work vs External)
 */
function formatTrackerSummary(trackerDoc) {
  const obj = trackerDoc.toObject ? trackerDoc.toObject() : trackerDoc;
  const isLinked = Boolean(obj.work && typeof obj.work === 'object' && obj.work._id);

  let title = obj.title || '';
  let contentType = obj.contentType || 'NOVEL';
  let genre = obj.genre || 'General';
  let language = obj.language || 'English';

  let draftedCount = 0;
  let editedCount = 0;
  let publishedCount = 0;
  let totalChapters = 0;
  let totalWordCount = 0;
  let chaptersBreakdown = [];

  if (isLinked) {
    title = obj.work.title || title;
    contentType = obj.work.contentType || contentType;
    genre = obj.work.genre || genre;
    language = obj.work.language || language;

    const chapters = obj.work.chapters || [];
    chaptersBreakdown = chapters.map((ch) => ({
      _id: ch._id,
      title: ch.title,
      chapterNumber: ch.chapterNumber,
      status: ch.status,
      wordCount: ch.wordCount || 0,
      publishedAt: ch.publishedAt,
    }));

    draftedCount = chapters.filter((c) => c.status === 'DRAFT').length;
    publishedCount = chapters.filter((c) => c.status === 'PUBLISHED').length;
    editedCount = 0; // In-app Work chapters are either DRAFT or PUBLISHED
    totalChapters = chapters.length;

    totalWordCount = obj.work.stats?.totalWordCount || 0;
    if (!totalWordCount && chapters.length > 0) {
      totalWordCount = chapters.reduce((sum, c) => sum + (c.wordCount || 0), 0);
    }
  } else {
    draftedCount = obj.externalCounts?.drafted || 0;
    editedCount = obj.externalCounts?.edited || 0;
    publishedCount = obj.externalCounts?.published || 0;
    totalChapters = draftedCount + editedCount + publishedCount;
    totalWordCount = obj.totalWordCount || 0;
  }

  const lastWorked = obj.lastWorkedAt
    ? new Date(obj.lastWorkedAt)
    : isLinked && obj.work.updatedAt
    ? new Date(obj.work.updatedAt)
    : new Date(obj.updatedAt || Date.now());

  const now = new Date();
  const diffMs = now.getTime() - lastWorked.getTime();
  const isNeglected = ACTIVE_STATUSES.includes(obj.trackerStatus) && diffMs >= NEGLECT_THRESHOLD_MS;
  const daysNeglected = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const coverImage = (isLinked && obj.work?.coverImage) ? obj.work.coverImage : (obj.coverImage || '');

  return {
    ...obj,
    title,
    contentType,
    genre,
    coverImage,
    language,
    isLinked,
    counts: {
      drafted: draftedCount,
      edited: editedCount,
      published: publishedCount,
      totalChapters,
      totalWordCount,
      plannedChapters: obj.plannedChapters || null,
    },
    chaptersBreakdown,
    lastWorkedAt: lastWorked,
    isNeglected,
    daysNeglected,
  };
}

/**
 * Calculate current daily writing streak for a user
 */
async function calculateStreak(userId) {
  const logs = await WritingLog.find({ user: userId, wordsWritten: { $gt: 0 } })
    .sort({ date: -1 })
    .lean();

  if (!logs || logs.length === 0) return 0;

  // Set of dates formatted YYYY-MM-DD
  const dateSet = new Set(
    logs.map((l) => new Date(l.date).toISOString().split('T')[0])
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let checkDate = new Date();
  if (!dateSet.has(todayStr)) {
    if (!dateSet.has(yesterdayStr)) {
      return 0; // Streak broken if no writing today or yesterday
    }
    checkDate = yesterday;
  }

  let streak = 0;
  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (dateSet.has(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Aggregate daily word count for the last 30 days
 */
async function get30DayWordStats(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const logs = await WritingLog.find({
    user: userId,
    date: { $gte: thirtyDaysAgo },
  }).lean();

  const dailyMap = {};
  logs.forEach((log) => {
    const dStr = new Date(log.date).toISOString().split('T')[0];
    dailyMap[dStr] = (dailyMap[dStr] || 0) + log.wordsWritten;
  });

  const result = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    result.push({
      date: dStr,
      label: monthDay,
      words: dailyMap[dStr] || 0,
    });
  }

  return result;
}

module.exports = {
  formatTrackerSummary,
  calculateStreak,
  get30DayWordStats,
  ACTIVE_STATUSES,
};
