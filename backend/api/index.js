const serverless = require('serverless-http');
const app = require('../app');

module.exports = serverless(app);
connectDB(); // Only run once at cold start

module.exports = serverless(app);
