const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const { sendContactEmail } = require('../utils/mailer');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    console.log('📬 New contact message from:', email);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Save to DB
    const msg = await Message.create({ name, email, subject, message });
    console.log('✅ Message saved to DB:', msg._id);

    // Send email notification (non-blocking)
    sendContactEmail({ name, email, subject, message }).catch((err) => {
      console.error('⚠️ Email send failed (non-critical):', err.message);
    });

    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('❌ Contact submit error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/contact
// @desc    Get all messages (admin inbox)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('📬 GET /api/contact (admin)');
    const messages = await Message.find().sort({ createdAt: -1 });
    const unreadCount = await Message.countDocuments({ read: false });
    console.log(`✅ Found ${messages.length} messages (${unreadCount} unread)`);
    res.json({ messages, unreadCount });
  } catch (err) {
    console.error('❌ Get messages error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/contact/:id
// @desc    Toggle message read status
// @access  Private
router.patch('/:id', protect, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    msg.read = !msg.read;
    await msg.save();
    console.log(`✅ Message ${msg._id} marked as ${msg.read ? 'read' : 'unread'}`);
    res.json({ message: msg });
  } catch (err) {
    console.error('❌ Update message error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a message
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    console.log('✅ Message deleted:', msg._id);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('❌ Delete message error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
