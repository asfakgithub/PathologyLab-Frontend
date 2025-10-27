import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme definitions
export const themes = {
  light: {
    name: 'Light',
    colors: {
      primary: '#1976d2',
      primaryLight: '#42a5f5',
      primaryDark: '#1565c0',
      secondary: '#dc004e',
      secondaryLight: '#ff5983',
      secondaryDark: '#9a0036',
      background: '#ffffff',
      backgroundSecondary: '#f5f5f5',
      backgroundTertiary: '#fafafa',
      surface: '#ffffff',
      surfaceSecondary: '#f8f9fa',
      text: '#212529',
      textSecondary: '#6c757d',
      textMuted: '#868e96',
      border: '#dee2e6',
      borderLight: '#e9ecef',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowHover: 'rgba(0, 0, 0, 0.15)',
      overlay: 'rgba(0, 0, 0, 0.5)',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardBackground: '#ffffff',
      inputBackground: '#ffffff',
      inputBorder: '#ced4da',
      buttonHover: '#0056b3',
      accent: '#6f42c1'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      pill: '50px'
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem',
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
    }
  },
  
  dark: {
    name: 'Dark',
    colors: {
      primary: '#3b82f6',
      primaryLight: '#60a5fa',
      primaryDark: '#1d4ed8',
      secondary: '#f59e0b',
      secondaryLight: '#fbbf24',
      secondaryDark: '#d97706',
      background: '#111827',
      backgroundSecondary: '#1f2937',
      backgroundTertiary: '#374151',
      surface: '#1f2937',
      surfaceSecondary: '#374151',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      textMuted: '#9ca3af',
      border: '#374151',
      borderLight: '#4b5563',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowHover: 'rgba(0, 0, 0, 0.4)',
      overlay: 'rgba(0, 0, 0, 0.7)',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardBackground: '#1f2937',
      inputBackground: '#374151',
      inputBorder: '#4b5563',
      buttonHover: '#1e40af',
      accent: '#8b5cf6'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      pill: '50px'
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem',
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.3)'
    }
  },

  cyberpunk: {
    name: 'Cyberpunk',
    colors: {
      primary: '#00ffff',
      primaryLight: '#66ffff',
      primaryDark: '#00cccc',
      secondary: '#ff00ff',
      secondaryLight: '#ff66ff',
      secondaryDark: '#cc00cc',
      background: '#0a0a0a',
      backgroundSecondary: '#1a1a2e',
      backgroundTertiary: '#16213e',
      surface: '#1a1a2e',
      surfaceSecondary: '#16213e',
      text: '#00ffff',
      textSecondary: '#b300ff',
      textMuted: '#7f7f7f',
      border: '#0f3460',
      borderLight: '#533a7b',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0040',
      info: '#00b4ff',
      shadow: 'rgba(0, 255, 255, 0.3)',
      shadowHover: 'rgba(255, 0, 255, 0.3)',
      overlay: 'rgba(0, 0, 0, 0.8)',
      gradient: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #ffff00 100%)',
      cardBackground: '#1a1a2e',
      inputBackground: '#16213e',
      inputBorder: '#0f3460',
      buttonHover: '#00cccc',
      accent: '#ff00ff'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    borderRadius: {
      sm: '2px',
      md: '4px',
      lg: '6px',
      xl: '8px',
      pill: '50px'
    },
    typography: {
      fontFamily: '"Courier New", "Lucida Console", monospace',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem',
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    shadows: {
      sm: '0 0 5px rgba(0, 255, 255, 0.5)',
      md: '0 0 10px rgba(0, 255, 255, 0.5)',
      lg: '0 0 20px rgba(255, 0, 255, 0.5)',
      xl: '0 0 30px rgba(255, 0, 255, 0.5)'
    }
  },

  darkPink: {
    name: 'Dark Pink',
    colors: {
      primary: '#ff1493',
      primaryLight: '#ff69b4',
      primaryDark: '#c71585',
      secondary: '#ffd700',
      secondaryLight: '#ffff00',
      secondaryDark: '#ffa500',
      background: '#2d1b3d',
      backgroundSecondary: '#3a2454',
      backgroundTertiary: '#4a2d6b',
      surface: '#3a2454',
      surfaceSecondary: '#4a2d6b',
      text: '#fff0f5',
      textSecondary: '#dda0dd',
      textMuted: '#c8a2c8',
      border: '#8b008b',
      borderLight: '#9370db',
      success: '#98fb98',
      warning: '#ffd700',
      error: '#ff69b4',
      info: '#da70d6',
      shadow: 'rgba(255, 20, 147, 0.3)',
      shadowHover: 'rgba(255, 105, 180, 0.4)',
      overlay: 'rgba(45, 27, 61, 0.8)',
      gradient: 'linear-gradient(135deg, #ff1493 0%, #9370db 50%, #4b0082 100%)',
      cardBackground: '#3a2454',
      inputBackground: '#4a2d6b',
      inputBorder: '#8b008b',
      buttonHover: '#c71585',
      accent: '#da70d6'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    borderRadius: {
      sm: '6px',
      md: '12px',
      lg: '18px',
      xl: '24px',
      pill: '50px'
    },
    typography: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        xxl: '1.5rem',
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    shadows: {
      sm: '0 2px 4px rgba(255, 20, 147, 0.2)',
      md: '0 4px 8px rgba(255, 20, 147, 0.2)',
      lg: '0 8px 16px rgba(255, 20, 147, 0.3)',
      xl: '0 16px 32px rgba(255, 20, 147, 0.3)'
    }
  }
};

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('pathologylab-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pathologylab-theme', currentTheme);
    
    // Apply CSS custom properties to root
    const root = document.documentElement;
    const theme = themes[currentTheme];
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply spacing variables
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply border radius variables
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
    
    // Apply typography variables
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value);
    });
    
    // Apply shadow variables
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Apply theme class to body
    document.body.className = `theme-${currentTheme}`;
    
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes: Object.keys(themes),
    changeTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
