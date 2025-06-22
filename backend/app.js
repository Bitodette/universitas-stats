const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const statisticsRoutes = require('./routes/statisticsRoutes');
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const admissionPathRoutes = require('./routes/admissionPathRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Logging in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/statistics', statisticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/admission-paths', admissionPathRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API untuk Universitas Statistik berjalan...');
});

// Error handler
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route tidak ditemukan'
  });
});

module.exports = app;