const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const { debug } = require('../utils/debugger');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpireIn
  });
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan'
      });
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'editor'
    });
    
    // Generate token
    const token = generateToken(user.id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    debug('Registration error:', error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    debug(`Login attempt for email: ${email}`);
    
    // Check for user
    let user;
    try {
      user = await User.findOne({ where: { email } });
      debug('User query completed');
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      debug('Database error during login:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed. Please try again later.'
      });
    }
    
    if (!user) {
      debug('No user found with this email');
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }
    
    // Check if password matches
    let isMatch = false;
    try {
      isMatch = await user.matchPassword(password);
      debug('Password verification completed');
    } catch (pwError) {
      console.error('Password verification error:', pwError);
      debug('Password verification error:', pwError);
      return res.status(500).json({
        success: false,
        message: 'Authentication error. Please try again later.'
      });
    }
    
    if (!isMatch) {
      debug('Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      debug('User account is inactive');
      return res.status(401).json({
        success: false,
        message: 'Akun anda tidak aktif'
      });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    debug('Login successful');
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    debug('Unhandled login error:', error);
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    debug('Error fetching user profile:', error);
    next(error);
  }
};