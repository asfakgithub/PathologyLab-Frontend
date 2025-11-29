import { useContext, useEffect, useState } from 'react';
import { SettingsContext } from '../../context/SettingsContext';
import { useTheme } from '../../core/hooks/useTheme';
import themeService from '../../services/themeService';

const ThemeHandler = () => {
  const { settings } = useContext(SettingsContext);
  const [themes, setThemes] = useState([]);
  const { changeTheme } = useTheme();

  // Fetch all available themes once
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const themesData = await themeService.getThemes();
        // Support multiple response formats: { data: [...] } or { data: { themes: [...] } } or direct array
        const payload = themesData?.data ?? themesData;
        if (Array.isArray(payload)) {
          setThemes(payload);
        } else if (payload && Array.isArray(payload.themes)) {
          setThemes(payload.themes);
        } else if (payload && Array.isArray(payload.data)) {
          setThemes(payload.data);
        }
      } catch (error) {
        console.error('Error fetching themes for handler:', error);
      }
    };
    fetchThemes();
  }, []);

  // Apply the theme when settings or available themes change
  useEffect(() => {
    if (settings.theme?.themeName && themes.length > 0) {
      const targetName = String(settings.theme.themeName || '').toLowerCase();
      const currentThemeObject = themes.find(t => {
        const nameMatch = String(t.name || '').toLowerCase() === targetName;
        const keyMatch = t.key && String(t.key || '').toLowerCase() === targetName;
        return nameMatch || keyMatch;
      });
      if (currentThemeObject) {
        // Apply CSS variables
        themeService.applyTheme(currentThemeObject);
        // Also update the ThemeContext so MUI theme and app state reflect chosen theme
        const desiredKey = (currentThemeObject.key || currentThemeObject.name || '').toString().toLowerCase();
        if (desiredKey && typeof changeTheme === 'function') {
          changeTheme(desiredKey);
        }
      }
    }
  }, [settings.theme, themes, changeTheme]);

  return null; // This component does not render anything
};

export default ThemeHandler;
