const debug = (message, data = null) => {
  if (process.env.DEBUG === 'true') {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG ${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
};

const logEnvironment = () => {
  debug('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    // Never log passwords
    DB_PASSWORD: process.env.DB_PASSWORD ? '***HIDDEN***' : 'not set',
  });
};

module.exports = { debug, logEnvironment };
