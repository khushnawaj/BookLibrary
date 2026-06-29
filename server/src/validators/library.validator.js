const { body, param, query } = require('express-validator');
const { SHELF_TYPES } = require('../constants');
const { LIBRARY_SORT_MAP } = require('../utils/sort.util');

const shelfTypeValues = Object.values(SHELF_TYPES);

const createLibraryValidator = [
  body('book').isMongoId().withMessage('Valid book ID is required'),

  body('shelfType')
    .optional()
    .isIn(shelfTypeValues)
    .withMessage(`Shelf type must be one of: ${shelfTypeValues.join(', ')}`),

  body('rating')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('review').optional().trim().isLength({ max: 2000 }).withMessage('Review cannot exceed  characters'),

  body('notes').optional().trim().isLength({ max: 5000 }).withMessage('Notes cannot exceed 5000 characters'),

  body('startedAt').optional().isISO8601().withMessage('Started date must be a valid date'),

  body('finishedAt')
    .optional()
    .isISO8601()
    .withMessage('Finished date must be a valid date')
    .custom((value, { req }) => {
      if (req.body.startedAt && new Date(value) < new Date(req.body.startedAt)) {
        throw new Error('Finished date must be after started date');
      }
      return true;
    }),
];

const updateLibraryValidator = [
  param('id').isMongoId().withMessage('Invalid library entry ID'),

  body('shelfType')
    .optional()
    .isIn(shelfTypeValues)
    .withMessage(`Shelf type must be one of: ${shelfTypeValues.join(', ')}`),

  body('rating')
    .optional({ values: 'null' })
    .custom((value) => {
      if (value === null) return true;
      const num = Number(value);
      if (!Number.isInteger(num) || num < 1 || num > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      return true;
    }),

  body('review').optional().trim().isLength({ max: 2000 }),
  body('notes').optional().trim().isLength({ max: 5000 }),
  body('startedAt').optional({ values: 'null' }).isISO8601(),
  body('finishedAt')
    .optional({ values: 'null' })
    .isISO8601()
    .custom((value, { req }) => {
      if (value === null) return true;
      const started = req.body.startedAt;
      if (started && new Date(value) < new Date(started)) {
        throw new Error('Finished date must be after started date');
      }
      return true;
    }),
];

const listLibraryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('shelfType')
    .optional()
    .isIn(shelfTypeValues)
    .withMessage(`Shelf type must be one of: ${shelfTypeValues.join(', ')}`),
  query('sort')
    .optional()
    .isIn(Object.keys(LIBRARY_SORT_MAP))
    .withMessage('Sort must be one of: newest, oldest'),
];

const libraryIdValidator = [param('id').isMongoId().withMessage('Invalid library entry ID')];

module.exports = {
  createLibraryValidator,
  updateLibraryValidator,
  listLibraryValidator,
  libraryIdValidator,
};
