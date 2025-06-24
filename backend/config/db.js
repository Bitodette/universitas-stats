require('dotenv').config();
const { Sequelize } = require('sequelize');
const { debug } = require('../utils/debugger');

let sequelize;

try {
  debug('Initializing database connection');

  // Use DATABASE_URL if present, otherwise use individual env vars
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
    // Use local connection details
    sequelize = new Sequelize(
      process.env.DB_NAME || 'universitas_stats',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password_anda',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  }
} catch (error) {
  console.error('Error initializing Sequelize:', error.message);
  debug('Database initialization error:', error);
  sequelize = new Sequelize('sqlite::memory:');
}

const connectDB = async () => {
  try {
    debug('Attempting to authenticate database connection');
    await sequelize.authenticate();
    console.log('Database terhubung berhasil!');
    debug('Database connection successful');
    await sequelize.sync({ force: false, alter: false });
    console.log('Database tables synchronized (without dropping data)');
    debug('Database tables synced without data loss');
  } catch (error) {
    console.error('Gagal terhubung ke database:', error);
    debug('Database connection failed:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectDB };
