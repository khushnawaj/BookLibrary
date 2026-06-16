const express = require('express');
const { HTTP_STATUS } = require('../constants');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'ShelfForge API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Feature routes
router.use('/auth', require('./auth.routes'));
router.use('/books', require('./book.routes'));
router.use('/library', require('./library.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/upload', require('./upload.routes'));
router.use('/users', require('./user.routes'));
router.use('/posts', require('./post.routes'));
router.use('/feed', require('./feed.routes'));
router.use('/google-books', require('./googleBooks.routes'));

module.exports = router;
