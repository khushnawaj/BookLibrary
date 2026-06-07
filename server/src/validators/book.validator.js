const { body, param, query } = require('express-validator');
const { SHELF_TYPES } = require('../constants');
const { BOOK_SORT_MAP } = require('../utils/sort.util');

const purchaseLinkValidator = [
  body('purchaseLinks.*.platform')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Platform name cannot exceed 50 characters'),
  body('purchaseLinks.*.url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid purchase URL'),
];

const createBookValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 300 })
    .withMessage('Title cannot exceed 300 characters'),

  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ max: 200 })
    .withMessage('Author name cannot exceed 200 characters'),

  body('publisher')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Publisher name cannot exceed 200 characters'),

  body('publicationDate')
    .optional()
    .isISO8601()
    .withMessage('Publication date must be a valid date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Publication date cannot be in the future');
      }
      return true;
    }),

  body('isbn')
    .optional()
    .trim()
    .matches(/^(?:\d[- ]?){13}$|^(?:\d[- ]?){10}$|^[\dX-]{10,17}$/i)
    .withMessage('Please provide a valid ISBN'),

  body('genre')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Genre cannot exceed 100 characters'),

  body('language')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Language cannot exceed 50 characters'),

  body('pages')
    .optional()
    .isInt({ min: 1, max: 50000 })
    .withMessage('Pages must be between 1 and 50000'),

  body('coverImage')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Cover image must be a valid URL'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),

  body('purchaseLinks')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Cannot have more than 10 purchase links'),

  ...purchaseLinkValidator,
];

const updateBookValidator = [
  param('id').isMongoId().withMessage('Invalid book ID'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 300 })
    .withMessage('Title cannot exceed 300 characters'),

  body('author')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Author cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Author name cannot exceed 200 characters'),

  body('publisher').optional().trim().isLength({ max: 200 }),
  body('publicationDate')
    .optional()
    .isISO8601()
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Publication date cannot be in the future');
      }
      return true;
    }),
  body('isbn')
    .optional()
    .trim()
    .matches(/^(?:\d[- ]?){13}$|^(?:\d[- ]?){10}$|^[\dX-]{10,17}$/i)
    .withMessage('Please provide a valid ISBN'),
  body('genre').optional().trim().isLength({ max: 100 }),
  body('language').optional().trim().isLength({ max: 50 }),
  body('pages').optional().isInt({ min: 1, max: 50000 }),
  body('coverImage')
    .optional({ values: 'null' })
    .trim()
    .custom((value) => {
      if (value === null || value === '') return true;
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('Cover image must be a valid URL');
      }
      return true;
    }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('purchaseLinks').optional().isArray({ max: 10 }),
  ...purchaseLinkValidator,
];

const listBooksValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 200 }).withMessage('Search term too long'),
  query('genre').optional().trim().isLength({ max: 100 }),
  query('language').optional().trim().isLength({ max: 50 }),
  query('sort')
    .optional()
    .isIn(Object.keys(BOOK_SORT_MAP))
    .withMessage('Sort must be one of: newest, oldest, title'),
];

const bookIdValidator = [param('id').isMongoId().withMessage('Invalid book ID')];

module.exports = {
  createBookValidator,
  updateBookValidator,
  listBooksValidator,
  bookIdValidator,
};
