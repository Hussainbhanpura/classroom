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
    const token = localStorage.getItem('token');
    console.log('Request URL:', config.url);
    console.log('Request Method:', config.method);
    console.log('Token present:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Final headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
instance.interceptors.response.use(
  (response) => {
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
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
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
