require('dotenv').config();
const { Sequelize } = require('sequelize');
const pg = require('pg');
const { debug } = require('../utils/debugger');

// Use DB_USERNAME if available, fallback to DB_USER for backward compatibility
const DB_USERNAME = process.env.DB_USERNAME || process.env.DB_USER || 'postgres';

debug('process.env:', {
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DATABASE_URL: process.env.DATABASE_URL,
});

let sequelize;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  debug('Using DATABASE_URL for connection');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectModule: pg,
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
  sequelize = new Sequelize(
    process.env.DB_NAME || 'universitas_stats',
    DB_USERNAME,
    process.env.DB_PASSWORD || 'password_anda',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      dialectModule: pg,
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

let isInitialized = false;

const connectDB = async () => {
  if (isInitialized) return;
  try {
    debug('Attempting to authenticate database connection');
    await sequelize.authenticate();
    console.log('Database terhubung berhasil!');
    debug('Database connection successful');
    await sequelize.sync({ force: false, alter: false });
    console.log('Database tables synchronized (without dropping data)');
    debug('Database tables synced without data loss');
    isInitialized = true;
  } catch (error) {
    console.error('Gagal terhubung ke database:', error);
    debug('Database connection failed:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectDB };
module.exports = { sequelize, connectDB };
