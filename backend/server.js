const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); // Force Google/Cloudflare DNS for MongoDB SRV

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ MongoDB connected to:', process.env.MONGODB_URI.split('@')[1]?.split('/')[0]);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed!');
    console.error('   Error:', err.message);
    if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
      console.error('   ⚠️  Fix: Go to MongoDB Atlas → Security → Network Access');
      console.error('   ⚠️  Add IP: 0.0.0.0/0 (Allow from anywhere) and click Confirm');
    } else if (err.message.includes('Authentication failed') || err.message.includes('bad auth')) {
      console.error('   ⚠️  Fix: Check your username/password in MongoDB Atlas → Database Access');
    } else if (err.message.includes('ETIMEDOUT')) {
      console.error('   ⚠️  Fix: Your IP is not whitelisted. Add it in Network Access.');
    }
    process.exit(1);
  });
