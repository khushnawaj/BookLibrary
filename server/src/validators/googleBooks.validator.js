const { query } = require('express-validator');

const searchGoogleBooksValidator = [
  query('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Search query must be between 2 and 120 characters'),
];

module.exports = {
  searchGoogleBooksValidator,
};
