const express = require('express');
const router = express.Router();
const workController = require('../controllers/work.controller');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');

// Public / Optional Auth routes
router.get('/explore', optionalAuthenticate, workController.getExploreWorks);
router.get('/user/:username', optionalAuthenticate, workController.getUserWorks);
router.get('/:id', optionalAuthenticate, workController.getWorkById);

// Protected routes
router.post('/', authenticate, workController.createWork);
router.put('/:id', authenticate, workController.updateWork);
router.delete('/:id', authenticate, workController.deleteWork);

// Chapter management
router.post('/:id/chapters', authenticate, workController.addChapter);
router.put('/:id/chapters/:chapterId', authenticate, workController.updateChapter);

// Likes
router.post('/:id/like', authenticate, workController.toggleLikeWork);

module.exports = router;
