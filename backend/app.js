const express = require('express');
const cors = require('cors');
const { debug, logEnvironment } = require('./utils/debugger');
// Handle morgan import more gracefully
let morgan;
try {
  morgan = require('morgan');
} catch (err) {
  console.warn('Morgan logger not available, continuing without request logging');
}

// Routes
const statisticsRoutes = require('./routes/statisticsRoutes');
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const admissionPathRoutes = require('./routes/admissionPathRoutes');

const app = express();

// Log environment variables on startup
logEnvironment();

// Middleware
app.use(express.json());
app.use(cors());

// Logging in development mode
if (process.env.NODE_ENV === 'development' && morgan) {
  app.use(morgan('dev'));
}

// Health check endpoint that doesn't require database
app.get('/api/health', (req, res) => {
  debug('Health check endpoint called');
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint for vercel troubleshooting
app.get('/api/debug', (req, res) => {
  debug('Debug endpoint called');
  const envInfo = {
    nodeEnv: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    dbHost: process.env.DB_HOST,
    hasDBPassword: !!process.env.DB_PASSWORD,
    hasJwtSecret: !!process.env.JWT_SECRET
  };
  
  res.json({
    serverTime: new Date().toISOString(),
    environment: envInfo
  });
});

// Routes
app.use('/api/statistics', statisticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/admission-paths', admissionPathRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API untuk Universitas Statistik berjalan...');
});

// Custom error handler with improved logging
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  debug('Error handler triggered:', err);
  if (err.stack) {
    console.error(err.stack);
  }
  
  const { errorHandler } = require('./middleware/errorHandler');
  errorHandler(err, req, res, next);
});

// Handle 404
app.use((req, res) => {
  debug('404 Not Found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route tidak ditemukan'
  });
});

module.exports = app;