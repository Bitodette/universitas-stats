require('dotenv').config();
const { Client } = require('pg');

// Log connection details (without showing the actual password)
console.log('Attempting to connect to PostgreSQL with:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Database: postgres (system database)`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Password: ${process.env.DB_PASSWORD ? '********' : 'not set'}`);

// Connect to the default 'postgres' database first
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres'
});

async function checkConnection() {
  try {
    await client.connect();
    console.log('Successfully connected to PostgreSQL!');
    
    // Check if our application database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", 
      [process.env.DB_NAME]
    );
    
    if (result.rows.length > 0) {
      console.log(`Database '${process.env.DB_NAME}' exists.`);
    } else {
      console.log(`Database '${process.env.DB_NAME}' does not exist.`);
      console.log('Creating database...');
      
      // Create the database
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database '${process.env.DB_NAME}' created successfully!`);
    }
  } catch (err) {
    console.error('Connection error:', err);
    
    // Provide more user-friendly advice
    if (err.code === '28P01') {
      console.error('\nPassword authentication failed. Please make sure:');
      console.error('1. You have PostgreSQL installed on your computer');
      console.error('2. The password in .env matches your PostgreSQL user password');
      console.error('3. You may need to set a password for the "postgres" user:');
      console.error('   - Open SQL Shell (psql)');
      console.error('   - Connect as the postgres user');
      console.error('   - Run: ALTER USER postgres WITH PASSWORD \'1101\';');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('\nConnection refused. Please make sure:');
      console.error('1. PostgreSQL is installed and running on your computer');
      console.error('2. The port number is correct (default is 5432)');
    }
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

checkConnection();
