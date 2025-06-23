const redis = require('redis');
const { promisify } = require('util');
const { debug } = require('./debugger');

let redisClient;
let getAsync;
let setAsync;
let delAsync;

// Initialize Redis client
const initRedisClient = () => {
  try {
    const client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          // End reconnecting on specific error
          return new Error('The Redis server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          // End reconnecting after a specific timeout
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          // End reconnecting with built in error
          return undefined;
        }
        // Reconnect after
        return Math.min(options.attempt * 100, 3000);
      }
    });

    client.on('error', (err) => {
      debug('Redis client error:', err);
      // Don't throw error, we want to continue even without Redis
    });

    client.on('connect', () => {
      debug('Connected to Redis server');
    });

    // Promisify Redis methods
    getAsync = promisify(client.get).bind(client);
    setAsync = promisify(client.set).bind(client);
    delAsync = promisify(client.del).bind(client);

    return client;
  } catch (err) {
    debug('Error initializing Redis client:', err);
    // Return null if Redis is not available
    return null;
  }
};

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Initialize Redis client if not done already
    if (!redisClient) {
      redisClient = initRedisClient();
      if (!redisClient) {
        return next(); // Skip caching if Redis is not available
      }
    }

    const key = `__express__${req.originalUrl}`;

    try {
      const cachedData = await getAsync(key);
      if (cachedData) {
        debug(`Cache hit for ${req.originalUrl}`);
        const data = JSON.parse(cachedData);
        return res.json(data);
      }

      // Store the original json method
      const originalJson = res.json;

      // Override json method
      res.json = function(data) {
        // Cache the response
        setAsync(key, JSON.stringify(data), 'EX', duration)
          .catch(err => debug('Error setting cache:', err));
        
        // Call the original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (err) {
      debug('Error retrieving from cache:', err);
      next();
    }
  };
};

// Clear cache by pattern
const clearCache = async (pattern) => {
  if (!redisClient) {
    return;
  }

  try {
    const keys = await promisify(redisClient.keys).bind(redisClient)(`__express__${pattern}*`);
    if (keys.length > 0) {
      await delAsync(keys);
      debug(`Cleared cache for pattern: ${pattern}`);
    }
  } catch (err) {
    debug('Error clearing cache:', err);
  }
};

module.exports = {
  cache,
  clearCache,
  initRedisClient
};
