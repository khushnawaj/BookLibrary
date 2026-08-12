const express = require('express');
const router = express.Router();
const workController = require('../controllers/work.controller');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');

// Public / Optional Auth routes
router.get('/explore', optionalAuthenticate, workController.getExploreWorks);
router.get('/user/:username', optionalAuthenticate, workController.getUserWorks);
router.get('/:id', optionalAuthenticate, workController.getWorkById);
router.get('/:id/comments', optionalAuthenticate, workController.getWorkComments);

// Protected routes
router.post('/', authenticate, workController.createWork);
router.put('/:id', authenticate, workController.updateWork);
router.delete('/:id', authenticate, workController.deleteWork);

// Chapter management & Chapter likes
router.post('/:id/chapters', authenticate, workController.addChapter);
router.put('/:id/chapters/:chapterId', authenticate, workController.updateChapter);
router.delete('/:id/chapters/:chapterId', authenticate, workController.deleteChapter);
router.post('/:id/chapters/:chapterId/like', authenticate, workController.toggleLikeChapter);
router.post('/:id/chapters/:chapterId/rate', authenticate, workController.rateChapter);

// Work Likes
router.post('/:id/like', authenticate, workController.toggleLikeWork);

// Comments management
router.post('/:id/comments', authenticate, workController.addWorkComment);
router.post('/:id/comments/:commentId/like', authenticate, workController.toggleLikeWorkComment);
router.delete('/:id/comments/:commentId', authenticate, workController.deleteWorkComment);

module.exports = router;
