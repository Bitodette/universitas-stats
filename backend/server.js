const app = require('./app');
const config = require('./config/config');
const { connectDB } = require('./config/db');
const errorLogger = require('./utils/errorLogger');

// Connect to database
connectDB().catch(err => {
  errorLogger(err);
});

const PORT = config.port;

// Only start listening if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT} dalam mode ${config.env}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥');
  errorLogger(err);
  
  // Don't exit in production as it crashes serverless function
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Export the Express app for serverless environments
module.exports = app;