const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 }, // 32MB
});

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '81995afd703f5d59b1fca06f9266fd65';

// @route   POST /api/upload
// @desc    Upload image to ImgBB
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const form = new FormData();
    form.append('image', req.file.buffer.toString('base64'));

    const imgbbRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    if (imgbbRes.data && imgbbRes.data.success) {
      const url = imgbbRes.data.data.url;
      console.log('✅ Image uploaded to ImgBB:', url);
      return res.json({ url, data: imgbbRes.data.data });
    }

    res.status(400).json({ message: 'ImgBB upload failed' });
  } catch (err) {
    console.error('❌ Upload error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;
