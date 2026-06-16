const express = require('express');
const bookController = require('../controllers/book.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createBookValidator,
  updateBookValidator,
  listBooksValidator,
  bookIdValidator,
} = require('../validators/book.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', createBookValidator, validate, bookController.createBook);
router.get('/', listBooksValidator, validate, bookController.getBooks);
router.get('/:id', bookIdValidator, validate, bookController.getBookById);
router.put('/:id', updateBookValidator, validate, bookController.updateBook);
router.delete('/:id', bookIdValidator, validate, bookController.deleteBook);

module.exports = router;
