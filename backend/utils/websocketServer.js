const WebSocket = require('ws');
const { debug } = require('./debugger');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

let wss = null;

// Initialize WebSocket server
const initWebSocketServer = (server) => {
  // Create WebSocket server instance
  wss = new WebSocket.Server({
    server,
    path: '/ws',
    // Add authentication to WebSocket
    verifyClient: (info, cb) => {
      const token = new URL(info.req.url, 'http://localhost').searchParams.get('token');
      
      if (!token) {
        cb(false, 401, 'Unauthorized');
        return;
      }
      
      try {
        jwt.verify(token, config.jwtSecret);
        cb(true);
      } catch (err) {
        cb(false, 401, 'Unauthorized');
      }
    }
  });

  // Handle connection
  wss.on('connection', (ws, req) => {
    debug('Client connected to WebSocket');

    // Extract token from URL
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');
    let user = null;
    
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      user = { id: decoded.id };
      debug(`Authenticated WebSocket connection for user ID: ${user.id}`);
      
      // Send initial message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to WebSocket server',
        timestamp: new Date().toISOString()
      }));
    } catch (err) {
      ws.close();
      return;
    }

    // Handle messages from client
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        debug(`Received message: ${data.type || 'unknown'}`);
      } catch (e) {
        debug('Invalid message format');
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
      debug('Client disconnected from WebSocket');
    });
  });

  // Handle server errors
  wss.on('error', (error) => {
    debug('WebSocket server error:', error);
  });

  return wss;
};

// Broadcast message to all connected clients
const broadcast = (data) => {
  if (!wss) {
    debug('WebSocket server not initialized');
    return;
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Send message to specific user
const sendToUser = (userId, data) => {
  if (!wss) {
    debug('WebSocket server not initialized');
    return;
  }

  wss.clients.forEach((client) => {
    if (client.user && client.user.id === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = {
  initWebSocketServer,
  broadcast,
  sendToUser
};
