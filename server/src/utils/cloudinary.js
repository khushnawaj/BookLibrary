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
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== '8942398423'
  );
};

// Configure Multer Storage for Cloudinary with Local Fallback
const getCloudinaryStorage = (folderName) => {
  if (isCloudinaryConfigured()) {
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: `bookverse/${folderName}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 1200, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }],
      },
    });
  } else {
    // Local fallback disk storage
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
