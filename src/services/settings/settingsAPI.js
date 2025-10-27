/**
 * Settings Management API Service
 * Handles all settings-related API calls
 */
import apiClient from '../apiClient';

export const settingsAPI = {
  // Get all settings
  getAllSettings: async () => {
    try {
      const response = await apiClient.get('/settings/get');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get setting by key
  getSettingByKey: async (key) => {
    try {
      const response = await apiClient.get(`/settings/${key}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update setting
  updateSetting: async (key, value) => {
    try {
      const response = await apiClient.put(`/settings/${key}`, { value });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update multiple settings
  updateMultipleSettings: async (settings) => {
    try {
      const response = await apiClient.put('/settings/bulk', settings);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get lab information
  getLabInfo: async () => {
    try {
      const response = await apiClient.get('/settings/lab-info');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update lab information
  updateLabInfo: async (labInfo) => {
    try {
      const response = await apiClient.put('/settings/lab-info', labInfo);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get email settings
  getEmailSettings: async () => {
    try {
      const response = await apiClient.get('/settings/email');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update email settings
  updateEmailSettings: async (emailSettings) => {
    try {
      const response = await apiClient.put('/settings/email', emailSettings);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Test email configuration
  testEmailConfig: async (emailData) => {
    try {
      const response = await apiClient.post('/settings/email/test', emailData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get report templates
  getReportTemplates: async () => {
    try {
      const response = await apiClient.get('/settings/report-templates');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update report template
  updateReportTemplate: async (templateId, templateData) => {
    try {
      const response = await apiClient.put(`/settings/report-templates/${templateId}`, templateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user preferences
  getUserPreferences: async (userId) => {
    try {
      const response = await apiClient.get(`/settings/user-preferences/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user preferences
  updateUserPreferences: async (userId, preferences) => {
    try {
      const response = await apiClient.put(`/settings/user-preferences/${userId}`, preferences);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get system settings
  getSystemSettings: async () => {
    try {
      const response = await apiClient.get('/settings/system');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update system settings
  updateSystemSettings: async (systemSettings) => {
    try {
      const response = await apiClient.put('/settings/system', systemSettings);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get pricing settings
  getPricingSettings: async () => {
    try {
      const response = await apiClient.get('/settings/pricing');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update pricing settings
  updatePricingSettings: async (pricingSettings) => {
    try {
      const response = await apiClient.put('/settings/pricing', pricingSettings);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get notification settings
  getNotificationSettings: async () => {
    try {
      const response = await apiClient.get('/settings/notifications');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (notificationSettings) => {
    try {
      const response = await apiClient.put('/settings/notifications', notificationSettings);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get backup settings
  getBackupSettings: async () => {
    try {
      const response = await apiClient.get('/settings/backup');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update backup settings
  updateBackupSettings: async (backupSettings) => {
    try {
      const response = await apiClient.put('/settings/backup', backupSettings);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create manual backup
  createBackup: async () => {
    try {
      const response = await apiClient.post('/settings/backup/create');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get backup list
  getBackupList: async () => {
    try {
      const response = await apiClient.get('/settings/backup/list');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Restore from backup
  restoreBackup: async (backupId) => {
    try {
      const response = await apiClient.post(`/settings/backup/restore/${backupId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get security settings
  getSecuritySettings: async () => {
    try {
      const response = await apiClient.get('/settings/security');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update security settings
  updateSecuritySettings: async (securitySettings) => {
    try {
      const response = await apiClient.put('/settings/security', securitySettings);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset settings to default
  resetToDefault: async (category) => {
    try {
      const response = await apiClient.post(`/settings/reset/${category}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default settingsAPI;
