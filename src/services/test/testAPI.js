/**
 * Test Management API Service
 * Handles all test-related API calls
 */
import apiClient from '../apiClient';

export const testAPI = {
  // Get all tests
  getAllTests: async (params = {}) => {
    try {
      const response = await apiClient.get('/tests/get', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get test by ID
  getTestById: async (testId) => {
    try {
      const response = await apiClient.get(`/tests/getTest/${testId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new test
  createTest: async (testData) => {
    try {
      const response = await apiClient.post('/tests/post', testData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update test
  updateTest: async (testId, testData) => {
    try {
      const response = await apiClient.put(`/tests/${testId}`, testData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete test
  deleteTest: async (testId) => {
    try {
      const response = await apiClient.delete(`/tests/${testId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search tests
  searchTests: async (searchQuery) => {
    try {
      const response = await apiClient.get('/tests/search', {
        params: { q: searchQuery }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get test statistics
  getTestStats: async () => {
    try {
      const response = await apiClient.get('/tests/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get tests by category
  getTestsByCategory: async (category) => {
    try {
      const response = await apiClient.get(`/tests/category/${category}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get tests by price range
  getTestsByPriceRange: async (minPrice, maxPrice) => {
    try {
      const response = await apiClient.get(`/tests/price-range/${minPrice}/${maxPrice}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get popular tests
  getPopularTests: async () => {
    try {
      const response = await apiClient.get('/tests/popular');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export tests data
  exportTestsData: async (format = 'csv') => {
    try {
      const response = await apiClient.get('/tests/export', {
        params: { format },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add subtest to test
  addSubtest: async (testId, subtestData) => {
    try {
      const response = await apiClient.post(`/tests/subtest/${testId}`, subtestData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update subtest
  updateSubtest: async (testId, subtestId, subtestData) => {
    try {
      const response = await apiClient.put(`/tests/subtest/${testId}/${subtestId}`, subtestData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete subtest
  deleteSubtest: async (testId, subtestId) => {
    try {
      const response = await apiClient.delete(`/tests/subtest/${testId}/${subtestId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default testAPI;
