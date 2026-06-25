const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized — no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ message: 'Not authorized — admin not found' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error('❌ Auth middleware error:', err.message);
    return res.status(401).json({ message: 'Not authorized — invalid token' });
  }
};

module.exports = { protect };
