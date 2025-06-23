require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');
const { debug } = require('../utils/debugger');

// Define the admin email and the new password
const ADMIN_EMAIL = 'admin@example.com';
const NEW_PASSWORD = 'password123';

console.log('Database connection details:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Password length: ${process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0}`);

const resetAdminPassword = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // Directly query the database to update the admin user password
    const [results] = await sequelize.query(
      'SELECT * FROM "Users" WHERE email = :email',
      {
        replacements: { email: ADMIN_EMAIL },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!results) {
      console.error('Admin user not found! Please run the seedAdmin.js script first.');
      process.exit(1);
    }
    
    console.log('Admin user found:', {
      id: results.id,
      username: results.username,
      email: results.email
    });

    // Generate a new hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);
    
    // Update the password directly in the database
    await sequelize.query(
      'UPDATE "Users" SET password = :password, "updatedAt" = NOW() WHERE id = :id',
      {
        replacements: { 
          password: hashedPassword, 
          id: results.id 
        }
      }
    );
    
    console.log('Admin password reset successful!');
    console.log('-----------------------------------');
    console.log('Admin credentials:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${NEW_PASSWORD}`);
    console.log('-----------------------------------');
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

resetAdminPassword();
