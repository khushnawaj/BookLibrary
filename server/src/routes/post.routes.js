const express = require('express');
const postController = require('../controllers/post.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', postController.createPost);
router.get('/saved', postController.getSavedPosts);
router.get('/:id', postController.getPostById);
router.delete('/:id', postController.deletePost);

router.post('/:id/like', postController.toggleLike);
router.post('/:id/save', postController.toggleSavePost);

router.post('/:id/comments', postController.addComment);
router.get('/:id/comments', postController.getComments);
router.delete('/:id/comments/:commentId', postController.deleteComment);

module.exports = router;
