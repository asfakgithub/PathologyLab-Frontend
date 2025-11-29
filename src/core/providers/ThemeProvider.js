import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import themeService from '../../services/themeService';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themes, setThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(null);

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await themeService.getThemes();
        // Support multiple response shapes: array, { themes: [...] }, { data: [...] }
        const payload = response?.data ?? response;
        let availableThemes = [];
        if (Array.isArray(payload)) availableThemes = payload;
        else if (payload && Array.isArray(payload.themes)) availableThemes = payload.themes;
        else if (payload && Array.isArray(payload.data)) availableThemes = payload.data;

        if (availableThemes.length > 0) {
          setThemes(availableThemes);
          
          const savedThemeKey = (localStorage.getItem('pathologylab-theme') || '').toString().toLowerCase();
          const savedThemeObject = localStorage.getItem('pathologylab-theme-object');

          let initialTheme;
          if (savedThemeKey) {
            initialTheme = availableThemes.find(t => {
              const key = (t.key || t.name || '').toString().toLowerCase();
              return key === savedThemeKey;
            });
          }
          
          if (initialTheme) {
            setCurrentTheme(initialTheme);
            themeService.applyTheme(initialTheme);
          } else if (savedThemeObject) {
            try {
              const themeFromObject = JSON.parse(savedThemeObject);
              setCurrentTheme(themeFromObject);
              themeService.applyTheme(themeFromObject);
            } catch (e) {
              console.warn("Could not parse saved theme object from local storage, falling back to first available theme.");
              initialTheme = response.data[0];
              setCurrentTheme(initialTheme);
              themeService.applyTheme(initialTheme);
            }
          }else {
            initialTheme = availableThemes[0];
            setCurrentTheme(initialTheme);
            themeService.applyTheme(initialTheme);
          }
        }
      } catch (error) {
        console.error("Failed to load themes:", error);
      }
    };

    loadThemes();
  }, []);

  const changeTheme = useCallback(async (themeId) => {
    // Accept either an _id, a key, or a name (case-insensitive)
    if (!themeId) return;
    const idStr = themeId.toString().toLowerCase();
    const themeToApply = themes.find(t => {
      if (!t) return false;
      if (t._id && t._id.toString() === themeId.toString()) return true;
      const key = (t.key || '').toString().toLowerCase();
      if (key && key === idStr) return true;
      const name = (t.name || '').toString().toLowerCase();
      return name === idStr;
    });

    if (themeToApply) {
      setCurrentTheme(themeToApply);
      themeService.applyTheme(themeToApply);
      // Persist by real theme id when possible
      const realId = themeToApply._id || themeToApply.id || (themeToApply.key || themeToApply.name);
      try {
        if (themeToApply._id) await themeService.saveUserThemePreference(themeToApply._id);
        else await themeService.saveUserThemePreference(realId);
      } catch (err) {
        console.warn('Failed to save user theme preference:', err);
      }
    } else {
      console.warn(`Theme with identifier "${themeId}" not found.`);
    }
  }, [themes]);

  const value = {
    currentTheme,
    themes,
    changeTheme,
    // For backward compatibility, if anything was using the key
    theme: currentTheme 
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;