import { isAuthenticated } from './authService';

let ws = null;
let reconnectTimeout = null;
let listeners = [];

export const connectWebSocket = () => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.warn('Cannot connect WebSocket: User not authenticated');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('Cannot connect WebSocket: Token not found');
    return;
  }

  // Close existing connection if any
  if (ws) {
    ws.close();
  }

  // Clear any existing reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  // Determine WebSocket URL based on environment
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = process.env.NODE_ENV === 'production' 
    ? 'universitas-stats.vercel.app' 
    : `${window.location.hostname}:5000`;
  
  const wsUrl = `${protocol}//${host}/ws?token=${token}`;
  
  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Notify all listeners
        listeners.forEach(listener => {
          listener(data);
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      if (event.code !== 1000) {
        console.log('WebSocket connection closed unexpectedly. Reconnecting...');
        
        // Reconnect after delay
        reconnectTimeout = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      } else {
        console.log('WebSocket connection closed');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
  }
};

export const disconnectWebSocket = () => {
  if (ws) {
    ws.close(1000, 'Deliberate disconnection');
    ws = null;
  }

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
};

export const addWebSocketListener = (listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

export const sendWebSocketMessage = (data) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
    return true;
  }
  return false;
};
