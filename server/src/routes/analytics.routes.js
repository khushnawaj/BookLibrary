const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', analyticsController.getAnalytics);
router.get('/achievements', analyticsController.getAchievements);
router.get('/goals', analyticsController.getGoals);
router.post('/goals', analyticsController.createGoal);
router.delete('/goals/:id', analyticsController.deleteGoal);

module.exports = router;
