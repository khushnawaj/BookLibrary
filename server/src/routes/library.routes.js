const express = require('express');
const libraryController = require('../controllers/library.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createLibraryValidator,
  updateLibraryValidator,
  listLibraryValidator,
  libraryIdValidator,
} = require('../validators/library.validator');
const { importLibrary } = require('../controllers/import.controller');
const { uploadDocument } = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(authenticate);

// Import Route
router.post('/import', uploadDocument.single('file'), importLibrary);

router.post('/', createLibraryValidator, validate, libraryController.createLibraryEntry);
router.get('/', listLibraryValidator, validate, libraryController.getLibraryEntries);
router.get('/:id', libraryIdValidator, validate, libraryController.getLibraryEntryById);
router.put('/:id', updateLibraryValidator, validate, libraryController.updateLibraryEntry);
router.delete('/:id', libraryIdValidator, validate, libraryController.deleteLibraryEntry);

module.exports = router;
