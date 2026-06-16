const express = require('express');
const { searchGoogleBooks } = require('../controllers/googleBooks.controller');
const { createRateLimiter } = require('../middlewares/rateLimiter.middleware');
const validate = require('../middlewares/validate.middleware');
const { searchGoogleBooksValidator } = require('../validators/googleBooks.validator');

const router = express.Router();

const googleBooksLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyPrefix: 'google-books',
  message: 'Too many book searches. Please wait a moment and try again.',
});

router.get('/search', googleBooksLimiter, searchGoogleBooksValidator, validate, searchGoogleBooks);

module.exports = router;
