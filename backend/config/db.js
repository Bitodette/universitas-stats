const { Sequelize } = require('sequelize');
const config = require('./config');

// Make sure pg is installed before creating Sequelize instance
let sequelize;

try {
  // Explicitly try to require pg to catch the error early with a better message
  require('pg');
  
  sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    {
      host: config.db.host,
      dialect: 'postgres',
      logging: config.env === 'development' ? console.log : false,
      dialectOptions: {
        ssl: config.env === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      pool: {
        max: 2, // Reduced for serverless environment
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} catch (error) {
  console.error('Error initializing Sequelize:', error.message);
  if (error.message.includes('Please install pg package manually')) {
    console.error('The pg package is missing. Please run: npm install pg pg-hstore');
  }
  // Create a dummy sequelize object to prevent crashes
  sequelize = new Sequelize('sqlite::memory:');
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database terhubung berhasil!');
  } catch (error) {
    console.error('Gagal terhubung ke database:', error);
    // Don't exit in production as it crashes serverless function
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectDB };
