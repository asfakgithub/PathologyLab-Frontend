import apiClient from './apiClient';
import { endpoints } from './api';

console.log('🔧 SETTINGS SERVICE DEBUG:');
console.log('  API client baseURL:', apiClient.defaults.baseURL);

// Settings API functions
export const settingsService = {
  // Get all settings
  getAllSettings: async () => {
    try {
      const endpoint = endpoints.settings.get;
      console.log('📡 GET ALL SETTINGS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET ALL SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Get organization settings
  getOrganizationSettings: async () => {
    try {
      const endpoint = '/settings/organization';
      console.log('📡 GET ORGANIZATION SETTINGS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET ORGANIZATION SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Update organization settings
  updateOrganizationSettings: async (settingsData) => {
    try {
      const endpoint = '/settings/organization';
      console.log('📡 UPDATE ORGANIZATION SETTINGS REQUEST:', `[PUT]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.put(endpoint, settingsData);
      return response;
    } catch (error) {
      console.error('❌ UPDATE ORGANIZATION SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Upload organization images (header, footer, seal, signature)
  uploadOrganizationImage: async (imageType, file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', imageType); // 'header', 'footer', 'seal', 'signature'

      const endpoint = '/settings/organization/upload-image';
      console.log('📡 UPLOAD ORGANIZATION IMAGE REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('❌ UPLOAD ORGANIZATION IMAGE ERROR:', error);
      throw error;
    }
  },

  // Get report settings
  getReportSettings: async () => {
    try {
      const endpoint = '/settings/reports';
      console.log('📡 GET REPORT SETTINGS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET REPORT SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Update report settings
  updateReportSettings: async (reportSettings) => {
    try {
      const endpoint = '/settings/reports';
      console.log('📡 UPDATE REPORT SETTINGS REQUEST:', `[PUT]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.put(endpoint, reportSettings);
      return response;
    } catch (error) {
      console.error('❌ UPDATE REPORT SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Get system settings
  getSystemSettings: async () => {
    try {
      const endpoint = endpoints.settings.systemInfo || '/settings/system';
      console.log('📡 GET SYSTEM SETTINGS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET SYSTEM SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Update system settings
  updateSystemSettings: async (systemSettings) => {
    try {
      const endpoint = '/settings/system';
      console.log('📡 UPDATE SYSTEM SETTINGS REQUEST:', `[PUT]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.put(endpoint, systemSettings);
      return response;
    } catch (error) {
      console.error('❌ UPDATE SYSTEM SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Get notification settings
  getNotificationSettings: async () => {
    try {
      const endpoint = '/settings/notifications';
      console.log('📡 GET NOTIFICATION SETTINGS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET NOTIFICATION SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (notificationSettings) => {
    try {
      const endpoint = '/settings/notifications';
      console.log('📡 UPDATE NOTIFICATION SETTINGS REQUEST:', `[PUT]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.put(endpoint, notificationSettings);
      return response;
    } catch (error) {
      console.error('❌ UPDATE NOTIFICATION SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Get security settings
  getSecuritySettings: async () => {
    try {
      const endpoint = '/settings/security';
      console.log('📡 GET SECURITY SETTINGS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET SECURITY SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Update security settings
  updateSecuritySettings: async (securitySettings) => {
    try {
      const endpoint = '/settings/security';
      console.log('📡 UPDATE SECURITY SETTINGS REQUEST:', `[PUT]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.put(endpoint, securitySettings);
      return response;
    } catch (error) {
      console.error('❌ UPDATE SECURITY SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Export settings
  exportSettings: async (format = 'json') => {
    try {
      const endpoint = endpoints.settings.export;
      console.log('📡 EXPORT SETTINGS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint, {
        params: { format },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('❌ EXPORT SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Import settings
  importSettings: async (settingsFile) => {
    try {
      const formData = new FormData();
      formData.append('settings', settingsFile);

      const endpoint = endpoints.settings.import;
      console.log('📡 IMPORT SETTINGS REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('❌ IMPORT SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Reset settings to defaults
  resetSettings: async (category = 'all') => {
    try {
      const endpoint = endpoints.settings.resetCategory(category) || '/settings/reset';
      console.log('📡 RESET SETTINGS REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.post(endpoint, { category });
      return response;
    } catch (error) {
      console.error('❌ RESET SETTINGS ERROR:', error);
      throw error;
    }
  },

  // Validate settings
  validateSettings: async (settingsData) => {
    try {
      const endpoint = endpoints.settings.validate || '/settings/validate';
      console.log('📡 VALIDATE SETTINGS REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.post(endpoint, settingsData);
      return response;
    } catch (error) {
      console.error('❌ VALIDATE SETTINGS ERROR:', error);
      throw error;
    }
  }
};

export default settingsService;
