const express = require('express');
const { HTTP_STATUS } = require('../constants');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'BookVerse API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Phase 2: mount feature routes
// router.use('/auth', require('./auth.routes'));
// router.use('/books', require('./book.routes'));
// router.use('/library', require('./library.routes'));
// router.use('/users', require('./user.routes'));

module.exports = router;
