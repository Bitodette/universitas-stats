const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Middleware untuk proteksi rute
exports.protect = async (req, res, next) => {
  let token;
  
  // Cek apakah token ada di header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Cek keberadaan token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Tidak diizinkan untuk mengakses rute ini'
    });
  }
  
  try {
    // Verifikasi token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Ambil data user dari token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User dengan token ini tidak ditemukan'
      });
    }
    
    // Tambahkan user ke request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Tidak diizinkan untuk mengakses rute ini'
    });
  }
};

// Middleware untuk pembatasan akses berdasarkan role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} tidak diizinkan untuk mengakses rute ini`
      });
    }
    next();
  };
};