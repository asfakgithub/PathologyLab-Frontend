import { useContext, useEffect, useState } from 'react';
import { SettingsContext } from '../../context/SettingsContext';
import themeService from '../../services/themeService';

const ThemeHandler = () => {
  const { settings } = useContext(SettingsContext);
  const [themes, setThemes] = useState([]);

  // Fetch all available themes once
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const themesData = await themeService.getThemes();
        if (themesData?.data?.themes) {
          setThemes(themesData.data.themes);
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
      const currentThemeObject = themes.find(t => t.name === settings.theme.themeName);
      if (currentThemeObject) {
        themeService.applyTheme(currentThemeObject);
      }
    }
  }, [settings.theme, themes]);

  return null; // This component does not render anything
};

export default ThemeHandler;
