/**
 * Authentication API Service
 * Handles all authentication related API calls
 */
import apiClient from './apiClient';

export const authAPI = {
  // User login
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // User registration
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/auth/verify');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/auth/profile', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.post('/auth/change-password', passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post(`/auth/reset-password/${token}`, { 
        password: newPassword 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await apiClient.post('/auth/refresh', { 
        refreshToken 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check if master user setup is needed
  checkSetup: async () => {
    try {
      const response = await apiClient.get('/auth/check-setup');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Setup master user
  setupMaster: async (masterData) => {
    try {
      const response = await apiClient.post('/auth/setup-master', masterData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default authAPI;
