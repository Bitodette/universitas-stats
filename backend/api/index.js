const serverless = require('serverless-http');
const app = require('../app');
const { connectDB } = require('../config/db');

connectDB(); // Only run once at cold start

module.exports = serverless(app);
