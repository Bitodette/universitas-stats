const app = require('./app');
const config = require('./config/config');
const { connectDB } = require('./config/db');
const { debug, logEnvironment } = require('./utils/debugger');

// Log environment variables
logEnvironment();

// Connect to database
connectDB();

// Health check endpoint for Vercel and API verification
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

// Set port
const PORT = process.env.PORT || 5000;

// Start server if not in production/Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// Export for Vercel serverless deployment
module.exports = app;