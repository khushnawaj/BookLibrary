const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const analyticsService = require('../services/analytics.service');

const getAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getReadingAnalytics(req.user._id);
  return ApiResponse.success(res, {
    message: 'Analytics retrieved successfully',
    data
  });
});

const getAchievements = asyncHandler(async (req, res) => {
  const achievements = await analyticsService.getAchievements(req.user._id);
  return ApiResponse.success(res, {
    message: 'Achievements retrieved successfully',
    data: { achievements }
  });
});

const getGoals = asyncHandler(async (req, res) => {
  const goals = await analyticsService.getGoals(req.user._id);
  return ApiResponse.success(res, {
    message: 'Goals retrieved successfully',
    data: { goals }
  });
});

const createGoal = asyncHandler(async (req, res) => {
  const goal = await analyticsService.createGoal(req.user._id, req.body);
  return ApiResponse.success(res, {
    message: 'Goal created successfully',
    data: { goal }
  });
});

const deleteGoal = asyncHandler(async (req, res) => {
  await analyticsService.deleteGoal(req.user._id, req.params.id);
  return ApiResponse.success(res, {
    message: 'Goal deleted successfully'
  });
});

module.exports = {
  getAnalytics,
  getAchievements,
  getGoals,
  createGoal,
  deleteGoal
};
