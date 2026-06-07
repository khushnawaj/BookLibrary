const multer = require('multer');
const { getCloudinaryStorage } = require('../utils/cloudinary');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../constants');

// For memory storage (CSV/Excel imports)
const memoryStorage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', HTTP_STATUS.BAD_REQUEST), false);
  }
};

// File filter for documents (CSV, Excel)
const documentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload only CSV or Excel files.', HTTP_STATUS.BAD_REQUEST), false);
  }
};

// Middleware for book cover upload to Cloudinary
const uploadBookCover = multer({
  storage: getCloudinaryStorage('covers'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware for avatar upload to Cloudinary
const uploadAvatar = multer({
  storage: getCloudinaryStorage('avatars'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Middleware for document import to memory
const uploadDocument = multer({
  storage: memoryStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = {
  uploadBookCover,
  uploadAvatar,
  uploadDocument,
};
