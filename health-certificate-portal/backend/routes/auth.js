// Authentication routes: login, logout, me.
const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Rate limit login attempts to prevent brute force attacks.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login requests per windowMs
  message: {
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body || {};

    // Validate input.
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Username and password must be text.' });
    }

    const admin = await User.findOne({ username: username.trim().toLowerCase() });

    // Use a constant-time comparison to avoid timing attacks.
    if (!admin || !(await admin.verifyPassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set the session cookie as HTTP-only, SameSite, and secure in production.
    res.cookie('adminSession', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    return res.json({
      message: 'Login successful.',
      user: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'An internal error occurred. Please try again later.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('adminSession', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  return res.json({
    user: { id: req.admin.id, username: req.admin.username },
  });
});

module.exports = router;