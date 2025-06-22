import axios from 'axios';

// Determine if we're running in production
const isProduction = process.env.NODE_ENV === 'production';

// Use the appropriate API URL
const API_URL = isProduction 
  ? 'https://universitas-stats.vercel.app/api' 
  : 'http://localhost:5000/api';

console.log('Using API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error') {
      console.error('API connection failed. Please check if the API server is running.');
    }
    return Promise.reject(error);
  }
);

// Function to validate API connection
export const validateApiConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    return response.data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error.message);
    return false;
  }
};

export default api;
