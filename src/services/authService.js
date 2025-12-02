import api, { endpoints } from './api';

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const response = await api.post(endpoints.auth.login, credentials);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed',
        error: error.error
      };
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await api.post(endpoints.auth.register, userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed',
        error: error.error
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await api.post(endpoints.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get(endpoints.auth.profile);
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get profile'
      };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put(endpoints.auth.profile, profileData);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.post(endpoints.auth.changePassword, passwordData);
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to change password'
      };
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post(endpoints.auth.forgotPassword, { email });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send reset link'
      };
    }
  }

  // Reset password
  async resetPassword(token, passwordData) {
    try {
      const response = await api.post(endpoints.auth.resetPassword(token), passwordData);
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to reset password'
      };
    }
  }

  // Verify token
  async verifyToken() {
    try {
      const response = await api.get(endpoints.auth.verify);
      return response;
    } catch (error) {
      console.error('Verify token error:', error);
      return { success: false };
    }
  }

  // Setup master user (one-time setup)
  async setupMasterUser(userData) {
    try {
      const response = await api.post(endpoints.auth.setupMaster, userData);
      return response;
    } catch (error) {
      console.error('Setup master user error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create master user'
      };
    }
  }

  // Check if setup is required
  async checkSetup() {
    try {
      const response = await api.get(endpoints.auth.checkSetup);
      return response;
    } catch (error) {
      console.error('Check setup error:', error);
      return {
        success: false,
        setupRequired: true,  // Assume setup is required if check fails
        message: error.message || 'Failed to check setup status'
      };
    }
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('tokenExpiry');

    if (!token || !expiry) {
      return false;
    }

    return new Date() < new Date(expiry);
  }

    // Parse expiry time string to milliseconds
    parseExpiryTime(expiryStr) {
        const match = expiryStr.match(/(\d+)([dhms])/);
        if (!match) return 24 * 60 * 60 * 1000; // Default 24 hours
    
        const value = parseInt(match[1]);
        const unit = match[2];
    
        switch (unit) {
          case 'd': return value * 24 * 60 * 60 * 1000;
          case 'h': return value * 60 * 60 * 1000;
          case 'm': return value * 60 * 1000;
          case 's': return value * 1000;
          default: return 24 * 60 * 60 * 1000;
        }
      }
}

const authService = new AuthService();
export default authService;

