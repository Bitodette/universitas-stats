// Load .env from backend folder explicitly
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { sequelize } = require('../config/db');
const { debug, logEnvironment } = require('../utils/debugger');

const checkConnection = async () => {
  console.log('Checking database connection...');
  console.log('------------------------------------------');
  
  // Log environment variables for debugging
  logEnvironment();
  
  console.log('Database configuration:');
  console.log(`Host: ${process.env.DB_HOST || 'Not set'}`);
  console.log(`Database: ${process.env.DB_NAME || 'Not set'}`);
  console.log(`User: ${process.env.DB_USER || 'Not set'}`);
  console.log(`Port: ${process.env.DB_PORT || '5432 (default)'}`);
  console.log(`Password: ${process.env.DB_PASSWORD ? '******** (set)' : 'Not set'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '******** (set)' : 'Not set'}`);
  console.log('------------------------------------------');
  
  try {
    // Attempt to authenticate connection
    await sequelize.authenticate();
    
    console.log('✅ Database connection established successfully.');
    
    // Get database version information
    try {
      const [results] = await sequelize.query('SELECT version();');
      if (results && results.length > 0) {
        console.log('Database version:', results[0].version);
      }
      
      // Check table existence
      try {
        const [tables] = await sequelize.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name;
        `);
        
        if (tables && tables.length > 0) {
          console.log('\nAvailable tables:');
          tables.forEach(table => {
            console.log(`- ${table.table_name}`);
          });
        } else {
          console.log('\nNo tables found in the database.');
        }
      } catch (tableError) {
        console.error('Error retrieving table information:', tableError.message);
      }
      
      // Get additional database info
      try {
        const dbInfo = await sequelize.query(`
          SELECT current_database() as database_name, 
                 current_user as current_user,
                 inet_server_addr() as server_address,
                 inet_server_port() as server_port;
        `);
        
        if (dbInfo && dbInfo[0] && dbInfo[0][0]) {
          console.log('\nConnection details:');
          console.log(`Database name: ${dbInfo[0][0].database_name}`);
          console.log(`Connected as: ${dbInfo[0][0].current_user}`);
          console.log(`Server address: ${dbInfo[0][0].server_address}`);
          console.log(`Server port: ${dbInfo[0][0].server_port}`);
        }
      } catch (dbInfoError) {
        console.error('Error retrieving detailed connection information:', dbInfoError.message);
      }
      
    } catch (queryError) {
      console.error('Error retrieving database information:', queryError.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error.message);
    
    if (error.message.includes('getaddrinfo ENOTFOUND') || 
        error.message.includes('connect ETIMEDOUT')) {
      console.error('\nPossible causes:');
      console.error('- Database server is not running or not accessible');
      console.error('- Incorrect hostname in DB_HOST environment variable');
      console.error('- Network connectivity issues');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\nPossible causes:');
      console.error('- Incorrect username or password');
      console.error('- Make sure DB_USER and DB_PASSWORD are set correctly');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\nPossible causes:');
      console.error('- The database does not exist');
      console.error('- Check DB_NAME environment variable');
      console.error('- You may need to create the database first');
    }
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('\nConnection closed.');
    process.exit(0);
  }
};

// Run the check
checkConnection();