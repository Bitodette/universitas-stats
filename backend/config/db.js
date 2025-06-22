const { Sequelize } = require('sequelize');
const config = require('./config');
const { debug } = require('../utils/debugger');

// Make sure pg is installed before creating Sequelize instance
let sequelize;

try {
  debug('Initializing database connection');
  debug('Database config:', {
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    username: config.db.username,
    env: config.env
  });

  // Check if running in Vercel
  const isVercel = process.env.VERCEL === '1';
  debug(`Running in Vercel: ${isVercel}`);

  // Explicitly try to require pg to catch the error early with a better message
  require('pg');
  
  // First try using DATABASE_URL if available, especially for Vercel deployment
  if (process.env.DATABASE_URL) {
    debug('Using DATABASE_URL for connection');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        keepAlive: true
      },
      logging: false,
      pool: {
        max: 3,
        min: 0,
        acquire: 30000,
        idle: 10000,
        evict: 1000
      }
    });
  } else {
    // Otherwise use individual config parameters
    const dbConfig = {
      host: config.db.host,
      dialect: 'postgres',
      logging: config.env === 'development' ? console.log : false,
      // Improve connection pooling for serverless environment
      pool: {
        max: 3,
        min: 0,
        acquire: 30000,
        idle: 10000,
        evict: 1000
      }
    };
    
    // Add SSL for production
    if (config.env === 'production') {
      debug('Adding SSL configuration for production');
      dbConfig.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        keepAlive: true
      };
    }
    
    sequelize = new Sequelize(
      config.db.database,
      config.db.username,
      config.db.password,
      dbConfig
    );
  }
} catch (error) {
  console.error('Error initializing Sequelize:', error.message);
  debug('Database initialization error:', error);
  
  if (error.message.includes('Please install pg package manually')) {
    console.error('The pg package is missing. Please run: npm install pg pg-hstore');
  }
  
  // Create a dummy sequelize object to prevent crashes
  sequelize = new Sequelize('sqlite::memory:');
}

const connectDB = async () => {
  try {
    debug('Attempting to authenticate database connection');
    await sequelize.authenticate();
    console.log('Database terhubung berhasil!');
    debug('Database connection successful');
  } catch (error) {
    console.error('Gagal terhubung ke database:', error);
    debug('Database connection failed:', error);
    
    // Don't exit in production as it crashes serverless function
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectDB };
module.exports = { sequelize, connectDB };
