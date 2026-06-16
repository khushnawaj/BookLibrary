const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '8942398423',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
});

const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  const invalidNames = ['demo', 'cloudinary_key', 'your_cloud_name', ''];
  const invalidKeys = ['8942398423', 'your_api_key', ''];
  return !!(
    name && !invalidNames.includes(name) &&
    key && !invalidKeys.includes(key) &&
    secret && !['your_api_secret', ''].includes(secret)
  );
};

const getCloudinaryStorage = (folderName) => {
  if (isCloudinaryConfigured()) {
    console.log(`[Cloudinary] Using cloud storage for folder: bookverse/${folderName}`);
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req, file) => ({
        folder: `bookverse/${folderName}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
      }),
    });
  } else {
    console.log(`[Cloudinary] Cloudinary not configured — using local disk storage for: ${folderName}`);
    const uploadPath = path.join(__dirname, '../../uploads', folderName);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, folderName + '-' + uniqueSuffix + path.extname(file.originalname));
      },
    });
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (isCloudinaryConfigured() && publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting from cloudinary', error);
  }
};

module.exports = {
  cloudinary,
  getCloudinaryStorage,
  deleteFromCloudinary,
  isCloudinaryConfigured,
};
