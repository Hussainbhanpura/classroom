import { jwtDecode } from 'jwt-decode';

// Token key in localStorage
const TOKEN_KEY = 'token';

// Store token in localStorage
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Check if user is logged in
export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

// Get user role from token
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    return null;
  }
};

// Get user ID from token
export const getUserId = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// Logout user
export const logout = () => {
  removeToken();
  window.location.href = '/login';
};
