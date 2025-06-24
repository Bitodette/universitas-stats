// Add path to resolve paths correctly
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

// Explicitly load .env file from correct location
const envFilePath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envFilePath)) {
  console.log(`Loading environment from: ${envFilePath}`);
  require('dotenv').config({ path: envFilePath });
} else {
  console.warn(`Warning: .env file not found at ${envFilePath}`);
  // Try default loading
  require('dotenv').config();
}

// Add explicit check for database password
if (!process.env.DB_PASSWORD) {
  console.error('Error: DB_PASSWORD environment variable is not set');
  console.log('Please ensure your .env file contains a DB_PASSWORD entry');
  process.exit(1);
}

// Print database connection details with appropriate defaults
console.log('Database connection details:');
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`Port: ${process.env.DB_PORT || '5432'}`);
console.log(`Database: ${process.env.DB_NAME || 'universitas_stats'}`);
console.log(`User: ${process.env.DB_USER || 'postgres'}`);
console.log(`Password: ${'*'.repeat(8)} (hidden)`);

// Explicitly create Sequelize with values
let sequelize;
if (process.env.DATABASE_URL) {
  // Use DATABASE_URL with SSL for Neon/Supabase
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'universitas_stats',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD, // This must be a string
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      dialect: 'postgres',
      logging: console.log
    }
  );
}

// Define User model for this script
const User = sequelize.define('User', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  role: {
    type: Sequelize.ENUM('admin', 'editor'),
    defaultValue: 'admin'
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

const seedAdmin = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Create the User table if it doesn't exist
    await User.sync();
    console.log('User table synchronized');
    
    const password = 'password123'; // Simple password for testing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Creating admin user...');
    
    // Look for existing admin user first
    const existingAdmin = await User.findOne({
      where: { email: 'admin@example.com' }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      // Only update password if it's different (avoid double hashing)
      const isMatch = await bcrypt.compare(password, existingAdmin.password);
      if (!isMatch) {
        // Hash the new password before saving
        const newHashedPassword = await bcrypt.hash(password, 10);
        existingAdmin.password = newHashedPassword;
        await existingAdmin.save();
        console.log('Admin password updated successfully');
      } else {
        console.log('Admin password is already up to date');
      }
    } else {
      // Create new admin user
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: password, // plain, will be hashed by beforeCreate
        role: 'admin',      // pastikan role admin
        isActive: true
      });
      console.log('Admin user created successfully');
    }

    console.log('------------------------------');
    console.log('Admin User Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: password123');
    console.log('------------------------------');

  } catch (error) {
    console.error('Error seeding admin user:', error);
    if (error.message.includes('must be a string')) {
      console.error('\nThe database password must be a string. Please check your .env file.');
    }
  } finally {
    try {
      await sequelize.close();
      console.log('Database connection closed');
    } catch (err) {
      // Ignore errors on close
    }
    process.exit(0);
  }
};

seedAdmin();
