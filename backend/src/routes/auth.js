const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

// POST /api/auth/login
router.post('/login',
  // Input Validation
  body('username').isAlphanumeric().withMessage('Username must be alphanumeric').isLength({ min: 3, max: 20 }),
  body('password').isAlphanumeric().withMessage('Password must be alphanumeric').isLength({ min: 3, max: 20 }),
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Create JWT
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Set HttpOnly cookie
      // If production, use secure: true, sameSite: 'strict'
      // If dev, secure: false, sameSite: 'lax'
      const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day in ms
      });

      return res.json({ message: 'Logged in successfully' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
);

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Clear the cookie
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: 'No auth token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ username: user.username, role: user.role });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
