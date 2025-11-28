import apiClient from './apiClient';

const getSettings = async () => {
  try {
    const response = await apiClient.get('/settings');
    return response;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

const updateSettings = async (settings) => {
  try {
    const response = await apiClient.put('/settings', settings);
    return response;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export { getSettings, updateSettings };