const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { uploadBookCover, uploadAvatar } = require('../middlewares/upload.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

// POST /api/v1/upload/book-cover
router.post('/book-cover', uploadBookCover.single('image'), uploadController.uploadImage);

// POST /api/v1/upload/avatar
router.post('/avatar', uploadAvatar.single('image'), uploadController.uploadImage);

module.exports = router;
