const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/tracker.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All tracker routes require authentication
router.use(authenticate);

router.get('/', trackerController.getTrackers);
router.post('/', trackerController.createTracker);
router.get('/unlinked-works', trackerController.getUnlinkedWorks);
router.get('/stats', trackerController.getTrackerStats);
router.get('/:id', trackerController.getTrackerById);
router.patch('/:id', trackerController.updateTracker);
router.delete('/:id', trackerController.deleteTracker);
router.post('/:id/log', trackerController.addWritingLog);

module.exports = router;
