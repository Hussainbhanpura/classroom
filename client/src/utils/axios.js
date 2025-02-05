import axios from 'axios';

// Create an axios instance with default config
const instance = axios.create({
  baseURL: 'http://localhost:3001', // Your backend API URL
  timeout: 10000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.message
      });

      // Only redirect to login for token-related errors
      if (error.response.status === 401 && 
          (error.response.data?.message === 'Token expired' || 
           error.response.data?.message === 'Invalid token' ||
           error.response.data?.message === 'No auth token found')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
