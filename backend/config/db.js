const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(
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
