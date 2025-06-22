const app = require('./app');
const config = require('./config/config');
const { connectDB } = require('./config/db');

// Connect to database
connectDB();

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT} dalam mode ${config.env}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});