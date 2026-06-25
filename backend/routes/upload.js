const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// @route   POST /api/upload
// @desc    Upload single image to Cloudinary
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('✅ Image uploaded to Cloudinary:', req.file.path);
    res.json({ url: req.file.path, public_id: req.file.filename });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images (screenshots)
// @access  Private
router.post('/multiple', protect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const urls = req.files.map((f) => f.path);
    console.log(`✅ ${urls.length} images uploaded to Cloudinary`);
    res.json({ urls });
  } catch (err) {
    console.error('❌ Multi-upload error:', err.message);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;
