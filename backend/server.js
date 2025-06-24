const app = require('./app');
const config = require('./config/config');
const { connectDB } = require('./config/db');
const { debug, logEnvironment } = require('./utils/debugger');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Ensure admin user exists
async function ensureAdminExists() {
  try {
    const admin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created (email: admin@example.com, password: password123)');
    }
  } catch (err) {
    console.error('Failed to ensure admin user exists:', err.message);
  }
}

// Log environment variables
logEnvironment();

// Connect to database and ensure admin exists
async function init() {
  try {
    await connectDB();
    await ensureAdminExists();
    // Start server only if not in production (Vercel will handle in prod)
    const PORT = process.env.PORT || 5000;
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      });
    }
  } catch (err) {
    console.error('Fatal error during server initialization:', err);
    process.exit(1);
  }
}

init();

// Export for Vercel serverless deployment
module.exports = app;