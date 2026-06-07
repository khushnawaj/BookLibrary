const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants');
const { isCloudinaryConfigured } = require('../utils/cloudinary');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload an image file', HTTP_STATUS.BAD_REQUEST);
  }

  let secureUrl = req.file.path;

  // Construct local HTTP URL if Cloudinary is not configured
  if (!isCloudinaryConfigured()) {
    const pathParts = req.file.destination.split(/[\\/]/);
    const folderName = pathParts[pathParts.length - 1]; // e.g. "covers" or "avatars"
    secureUrl = `${req.protocol}://${req.get('host')}/uploads/${folderName}/${req.file.filename}`;
  }

  const result = {
    secureUrl,
    publicId: req.file.filename,
    format: req.file.mimetype.split('/')[1],
    size: req.file.size,
  };

  return ApiResponse.success(res, {
    message: 'Image uploaded successfully',
    data: result,
  });
});

module.exports = {
  uploadImage,
};
