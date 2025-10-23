/**
 * Settings Service
 * ===============
 * 
 * Professional service for handling all settings-related API operations.
 * Manages organization settings, themes, branding, and system configuration.
 * 
 * Features:
 * - Organization settings management
 * - Theme and branding configuration
 * - System preferences
 * - Asset upload and management
 * 
 * Author: PathologyLab Development Team
 * Created: July 31, 2025
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class SettingsService {
  /**
   * Get organization settings
   */
  async getOrganizationSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/organization`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data: data.settings || data };
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      return { success: false, error: error.message, data: {} };
    }
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(settingsData) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/organization`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settingsData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating organization settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get theme settings
   */
  async getThemeSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/theme`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching theme settings:', error);
      return { success: false, error: error.message, data: {} };
    }
  }

  /**
   * Update theme settings
   */
  async updateThemeSettings(themeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(themeData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating theme settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload organization asset (logo, header, footer, etc.)
   */
  async uploadAsset(assetType, file) {
    try {
      const formData = new FormData();
      formData.append('asset', file);
      formData.append('type', assetType);

      const response = await fetch(`${API_BASE_URL}/settings/upload-asset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error uploading asset:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all available themes
   */
  async getAvailableThemes() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/themes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data: data.themes || data };
    } catch (error) {
      console.error('Error fetching available themes:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/user-preferences`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return { success: false, error: error.message, data: {} };
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/user-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get system settings
   */
  async getSystemSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/system`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return { success: false, error: error.message, data: {} };
    }
  }

  /**
   * Update system settings (admin only)
   */
  async updateSystemSettings(settings) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/system`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating system settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset settings to default
   */
  async resetToDefaults(settingType = 'all') {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type: settingType })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const settingsService = new SettingsService();
export default settingsService;
