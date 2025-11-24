import api, { endpoints } from './api';

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const response = await api.post(endpoints.auth.login, credentials);
      
      if (response.success && response.data) {
        // Backend may return token as `token` or `accessToken`. Support both.
        const { user, expiresIn } = response.data;
        const accessToken = response.data?.token || response.data?.accessToken || response.data?.authToken || null;

        if (accessToken) {
          // Store authentication data
          localStorage.setItem('authToken', accessToken);
          localStorage.setItem('user', JSON.stringify(user));
          if (expiresIn) {
            localStorage.setItem('tokenExpiry', new Date(Date.now() + this.parseExpiryTime(expiresIn)).toISOString());
          }

          // Note: refresh token is stored as httpOnly cookie by backend; do not store it in localStorage
          return { success: true, user, token: accessToken };
        }
        return { success: false, message: response.message || 'Login failed' };
      }
      
      return { success: false, message: response.message || 'Login failed' };
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
      
      if (response.success && response.data) {
        const { user } = response.data;
        const accessToken = response.data?.token || response.data?.accessToken || null;

        if (accessToken) {
          localStorage.setItem('authToken', accessToken);
          localStorage.setItem('user', JSON.stringify(user));
          return { success: true, user, token: accessToken };
        }
        return { success: false, message: response.message || 'Registration failed' };
      }
      
      return { success: false, message: response.message || 'Registration failed' };
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
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get(endpoints.auth.profile);
      
      if (response.success && response.data) {
        const { user } = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      
      return { success: false, message: response.message || 'Failed to get profile' };
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
      
      if (response.success && response.data) {
        const { user } = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      
      return { success: false, message: response.message || 'Failed to update profile' };
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
      
      return { 
        success: response.success, 
        message: response.message || (response.success ? 'Password changed successfully' : 'Failed to change password')
      };
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
      
      return { 
        success: response.success, 
        message: response.message || (response.success ? 'Password reset link sent' : 'Failed to send reset link')
      };
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
      
      if (response.success && response.data) {
        const { token: authToken } = response.data;
        localStorage.setItem('authToken', authToken);
        
        return { success: true, token: authToken };
      }
      
      return { success: false, message: response.message || 'Failed to reset password' };
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
      
      if (response.success && response.data) {
        const { user } = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Verify token error:', error);
      return { success: false };
    }
  }

  // Setup master user (one-time setup)
  async setupMasterUser(userData) {
    try {
      const response = await api.post(endpoints.auth.setupMaster, userData);
      
      if (response.success && response.data) {
        const { user, expiresIn } = response.data;
        const accessToken = response.data?.token || response.data?.accessToken || null;

        if (accessToken) {
          localStorage.setItem('authToken', accessToken);
          localStorage.setItem('user', JSON.stringify(user));
          if (expiresIn) {
            localStorage.setItem('tokenExpiry', new Date(Date.now() + this.parseExpiryTime(expiresIn)).toISOString());
          }
          return { success: true, user, token: accessToken };
        }
        return { success: response.success, message: response.message || 'Setup failed' };
      }
      
      return { 
        success: response.success, 
        message: response.message || (response.success ? 'Master user created successfully' : 'Failed to create master user')
      };
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
      
      return { 
        success: response.success, 
        setupRequired: response.data?.setupRequired || false,
        message: response.message
      };
    } catch (error) {
      console.error('Check setup error:', error);
      return { 
        success: false, 
        setupRequired: true,  // Assume setup is required if check fails
        message: error.message || 'Failed to check setup status' 
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !expiry) {
      return false;
    }
    
    return new Date() < new Date(expiry);
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return roles.includes(user?.role);
  }

  // Check if user is admin or higher
  isAdminOrHigher() {
    return this.hasAnyRole(['master', 'admin']);
  }

  // Check if user is staff or higher
  isStaffOrHigher() {
    return this.hasAnyRole(['master', 'admin', 'doctor', 'technician', 'receptionist']);
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

// export default new AuthService();
const authService = new AuthService();
export default authService;

