const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes (or conditionally protected based on profile visibility inside controller)
router.get('/profile/:username', optionalAuthenticate, userController.getUserProfile);
router.get('/profile/:username/posts', optionalAuthenticate, userController.getUserPosts);
router.get('/profile/:username/library', optionalAuthenticate, userController.getUserLibrary);
router.get('/:id/activities', userController.getActivities);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);

// Protected routes
router.use(authenticate);
router.put('/profile', userController.updateProfile);
router.post('/:id/follow', userController.followUser);
router.delete('/:id/follow', userController.unfollowUser);

module.exports = router;
