const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Helper: create a signed JWT that expires in 30 days
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_change_in_production', { expiresIn: '30d' });

// ── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate all fields present
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        missing: {
          name: !name,
          email: !email,
          password: !password,
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check duplicate email (case-insensitive — model lowercases it)
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'This email is already registered. Please log in.' });
    }

    // Create user — password is hashed by the pre-save hook in User model
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    console.log(`✅ New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: generateToken(user._id),
      user: {
        _id:         user._id,
        name:        user.name,
        email:       user.email,
        preferences: user.preferences,
        streak:      user.streak,
      },
    });
  } catch (error) {
    console.error('❌ Register error:', error.message);

    // Mongoose duplicate key error (race condition — two requests with same email)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This email is already registered.' });
    }
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: messages });
    }

    res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
};

// ── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // We need password for comparison — it's excluded by default (select: false)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log(`✅ User logged in: ${user.email}`);

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id:         user._id,
        name:        user.name,
        email:       user.email,
        preferences: user.preferences,
        streak:      user.streak,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login. Please try again.' });
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── PUT /api/auth/preferences ────────────────────────────────────────────────
const updatePreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: req.body },
      { new: true, runValidators: true }
    );
    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    console.error('❌ Update preferences error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updatePreferences };
