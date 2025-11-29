import apiClient from './apiClient';

console.log('🎨 THEME SERVICE DEBUG:');
console.log('  API client baseURL:', apiClient.defaults.baseURL);

class ThemeService {
  constructor() {
    this.baseURL = `/themes`;
    console.log('  THEME baseURL (relative):', this.baseURL);
  }

  // Get authorization header (if needed, apiClient already adds auth token)
  getAuthHeader() {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get all themes
  async getThemes(params = {}) {
    try {
      const fullURL = this.baseURL;
      console.log('📡 GET THEMES REQUEST:', fullURL, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(this.baseURL, { params });
      return response;
    } catch (error) {
      console.error('❌ GET THEMES ERROR:', error);
      throw this.handleError(error);
    }
  }

  // Create new theme
  async createTheme(themeData, files = {}) {
    try {
      // If there are files to upload, use multipart/form-data
      const hasFiles = files && (files.logo || files.backgroundImage || files.favicon);

      let response;
      if (hasFiles) {
        const formData = new FormData();
        // Add theme data as JSON fields
        Object.keys(themeData).forEach(key => {
          if (typeof themeData[key] === 'object' && themeData[key] !== null) {
            formData.append(key, JSON.stringify(themeData[key]));
          } else if (themeData[key] !== undefined && themeData[key] !== null) {
            formData.append(key, themeData[key]);
          }
        });

        // Add files
        if (files.logo) formData.append('logo', files.logo);
        if (files.backgroundImage) formData.append('backgroundImage', files.backgroundImage);
        if (files.favicon) formData.append('favicon', files.favicon);

        response = await apiClient.post(this.baseURL, formData, {
          headers: {
            ...this.getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // No files: send JSON body so nested objects are preserved
        response = await apiClient.post(this.baseURL, themeData, {
          headers: {
            ...this.getAuthHeader(),
            'Content-Type': 'application/json'
          }
        });
      }
      return response;
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
        const hasFiles = files && (files.logo || files.backgroundImage || files.favicon);

        let response;
        if (hasFiles) {
          const formData = new FormData();
          Object.keys(themeData).forEach(key => {
            if (typeof themeData[key] === 'object' && themeData[key] !== null) {
              formData.append(key, JSON.stringify(themeData[key]));
            } else if (themeData[key] !== undefined && themeData[key] !== null) {
              formData.append(key, themeData[key]);
            }
          });

          if (files.logo) formData.append('logo', files.logo);
          if (files.backgroundImage) formData.append('backgroundImage', files.backgroundImage);
          if (files.favicon) formData.append('favicon', files.favicon);

          response = await apiClient.put(`${this.baseURL}/${themeId}`, formData, {
            headers: {
              ...this.getAuthHeader(),
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          // Send JSON for updates without files so nested objects are preserved
          response = await apiClient.put(`${this.baseURL}/${themeId}`, themeData, {
            headers: {
              ...this.getAuthHeader(),
              'Content-Type': 'application/json'
            }
          });
        }
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Clone theme
  async cloneTheme(themeId, name, description) {
    try {
      const response = await apiClient.post(`${this.baseURL}/${themeId}/clone`, {
        name,
        description
      }, {
        headers: this.getAuthHeader()
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get theme preview CSS
  async getThemePreview(themeId) {
    try {
      const response = await apiClient.get(`${this.baseURL}/${themeId}/preview`, {
        headers: this.getAuthHeader()
      });
      return response;
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
      // Helper to convert hex color (#rrggbb or #rgb) to 'r,g,b'
      const hexToRgbString = (hex) => {
        if (typeof hex !== 'string') return null;
        const h = hex.replace('#', '').trim();
        if (h.length === 3) {
          const r = parseInt(h[0] + h[0], 16);
          const g = parseInt(h[1] + h[1], 16);
          const b = parseInt(h[2] + h[2], 16);
          return `${r}, ${g}, ${b}`;
        } else if (h.length === 6) {
          const r = parseInt(h.substring(0,2), 16);
          const g = parseInt(h.substring(2,4), 16);
          const b = parseInt(h.substring(4,6), 16);
          return `${r}, ${g}, ${b}`;
        }
        return null;
      };

      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
        // If value is a hex color, also expose an RGB var for rgba(...) usage
        const rgb = hexToRgbString(value);
        if (rgb) {
          root.style.setProperty(`--color-${key}-rgb`, rgb);
        }
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
    // Persist a canonical theme key (lowercased) and the full theme object
    try {
      const canonicalKey = (theme.key || theme.name || '').toString().toLowerCase();
      if (canonicalKey) localStorage.setItem('pathologylab-theme', canonicalKey);
      localStorage.setItem('pathologylab-theme-object', JSON.stringify(theme));

      // Apply a body class like `theme-dark` or `theme-cyberpunk` for theme-specific CSS
      const sanitizeForClass = (s) => s.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      // Remove any existing theme- classes
      try {
        document.body.classList.forEach(cls => {
          if (cls && cls.indexOf('theme-') === 0) document.body.classList.remove(cls);
        });
      } catch (e) {
        // classList.forEach might not be supported in very old browsers, fallback below
        Array.from(document.body.classList || []).forEach(cls => {
          if (cls && cls.indexOf('theme-') === 0) document.body.classList.remove(cls);
        });
      }

      if (canonicalKey) {
        const themedClass = `theme-${sanitizeForClass(canonicalKey)}`;
        document.body.classList.add(themedClass);
      }
    } catch (err) {
      console.warn('Failed to persist theme to localStorage:', err);
    }
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
