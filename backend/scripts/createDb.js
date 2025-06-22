const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1101',
  database: 'postgres' // Connect to default database first
});

async function createDatabase() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');
    
    // Check if database exists
    const checkDbResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'universitas_stats'"
    );
    
    if (checkDbResult.rows.length === 0) {
      // Database does not exist, create it
      await client.query('CREATE DATABASE universitas_stats');
      console.log('Database "universitas_stats" created successfully');
    } else {
      console.log('Database "universitas_stats" already exists');
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

createDatabase();
