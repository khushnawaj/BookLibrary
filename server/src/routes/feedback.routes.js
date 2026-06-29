const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

// All feedback routes require authentication
router.use(authenticate);

// Publicly accessible to logged-in users to submit feedback
router.post('/', feedbackController.createFeedback);

// Admin-only routes to view and update feedback/suggestions
router.get('/', authorize('ADMIN'), feedbackController.getAllFeedback);
router.put('/:id', authorize('ADMIN'), feedbackController.updateFeedbackStatus);

module.exports = router;
