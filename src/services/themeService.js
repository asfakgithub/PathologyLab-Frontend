import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}`;

console.log('🎨 THEME SERVICE DEBUG:');
console.log('  REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('  API_BASE_URL:', API_BASE_URL);

class ThemeService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/themes`;
    console.log('  THEME baseURL:', this.baseURL);
  }

  // Get authorization header
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get all themes
  async getThemes(params = {}) {
    try {
      const fullURL = this.baseURL;
      console.log('📡 GET THEMES REQUEST:', fullURL);
      const response = await axios.get(this.baseURL, {
        params,
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('❌ GET THEMES ERROR:', error);
      throw this.handleError(error);
    }
  }

  // Create new theme
  async createTheme(themeData, files = {}) {
    try {
      const formData = new FormData();
      
      // Add theme data
      Object.keys(themeData).forEach(key => {
        if (typeof themeData[key] === 'object' && themeData[key] !== null) {
          formData.append(key, JSON.stringify(themeData[key]));
        } else {
          formData.append(key, themeData[key]);
        }
      });

      // Add files
      if (files.logo) {
        formData.append('logo', files.logo);
      }
      if (files.backgroundImage) {
        formData.append('backgroundImage', files.backgroundImage);
      }
      if (files.favicon) {
        formData.append('favicon', files.favicon);
      }

      const response = await axios.post(this.baseURL, formData, {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update theme
  async updateTheme(themeId, themeData, files = {}) {
    try {
      const formData = new FormData();
      
      // Add theme data
      Object.keys(themeData).forEach(key => {
        if (typeof themeData[key] === 'object' && themeData[key] !== null) {
          formData.append(key, JSON.stringify(themeData[key]));
        } else {
          formData.append(key, themeData[key]);
        }
      });

      // Add files
      if (files.logo) {
        formData.append('logo', files.logo);
      }
      if (files.backgroundImage) {
        formData.append('backgroundImage', files.backgroundImage);
      }
      if (files.favicon) {
        formData.append('favicon', files.favicon);
      }

      const response = await axios.put(`${this.baseURL}/${themeId}`, formData, {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete theme
  async deleteTheme(themeId) {
    try {
      const response = await axios.delete(`${this.baseURL}/${themeId}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Clone theme
  async cloneTheme(themeId, name, description) {
    try {
      const response = await axios.post(`${this.baseURL}/${themeId}/clone`, {
        name,
        description
      }, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get theme preview CSS
  async getThemePreview(themeId) {
    try {
      const response = await axios.get(`${this.baseURL}/${themeId}/preview`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Apply theme to application
  applyTheme(theme) {
    if (!theme || !theme.colors) {
      console.warn('Invalid theme data provided');
      return;
    }

    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply typography
    if (theme.typography) {
      if (theme.typography.fontFamily) {
        root.style.setProperty('--font-family', theme.typography.fontFamily);
      }
      if (theme.typography.fontSize) {
        Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
          root.style.setProperty(`--font-size-${key}`, value);
        });
      }
    }

    // Apply spacing
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });
    }

    // Apply border radius
    if (theme.borderRadius) {
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--border-radius-${key}`, value);
      });
    }

    // Apply shadows
    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });
    }

    // Apply background image
    if (theme.assets?.backgroundImage) {
      document.body.style.backgroundImage = `url(${theme.assets.backgroundImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    } else {
      document.body.style.backgroundImage = 'none';
    }

    // Apply favicon
    if (theme.assets?.favicon) {
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = theme.assets.favicon;
    }

    // Store theme in localStorage for persistence
    localStorage.setItem('currentTheme', JSON.stringify(theme));
  }

  // Save user theme preference
  async saveUserThemePreference(themeId) {
    try {
      // This would typically be saved in user settings
      localStorage.setItem('userThemePreference', themeId);
      
      // If you have a user settings API, you could also save it there
      // await axios.patch('/api/v1/users/settings', { themeId }, {
      //   headers: this.getAuthHeader()
      // });
      
      return true;
    } catch (error) {
      console.error('Error saving theme preference:', error);
      return false;
    }
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1
      };
    }
  }

  // Validate theme data
  validateTheme(theme) {
    const errors = [];

    if (!theme.name || typeof theme.name !== 'string') {
      errors.push('Theme name is required and must be a string');
    }

    if (!theme.colors || typeof theme.colors !== 'object') {
      errors.push('Theme colors are required and must be an object');
    } else {
      const requiredColors = ['primary', 'secondary', 'background', 'surface', 'text'];
      requiredColors.forEach(color => {
        if (!theme.colors[color]) {
          errors.push(`Color ${color} is required`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

}

// export default new ThemeService();
const themeService = new ThemeService();
export default themeService;
