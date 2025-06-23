import axios from 'axios';

// Determine API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://universitas-stats.vercel.app/api'
                  : 'http://localhost:5000/api');

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // 15 seconds timeout
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
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

