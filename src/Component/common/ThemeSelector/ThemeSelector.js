import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import './ThemeSelector.css';

const ThemeSelector = ({ className = '', showLabel = true }) => {
  const { currentTheme, themes, changeTheme } = useTheme();

  const themeDisplayNames = {
    light: 'Light',
    dark: 'Dark', 
    cyberpunk: 'Cyberpunk',
    darkPink: 'Dark Pink'
  };

  const themeIcons = {
    light: '☀️',
    dark: '🌙',
    cyberpunk: '🤖',
    darkPink: '💖'
  };

  return (
    <div className={`theme-selector ${className}`}>
      {showLabel && (
        <label className="theme-selector__label">
          Theme
        </label>
      )}
      <div className="theme-selector__container">
        <select 
          className="theme-selector__select"
          value={currentTheme}
          onChange={(e) => changeTheme(e.target.value)}
        >
          {themes.map(themeName => (
            <option key={themeName} value={themeName}>
              {themeIcons[themeName]} {themeDisplayNames[themeName]}
            </option>
          ))}
        </select>
        
        <div className="theme-selector__buttons">
          {themes.map(themeName => (
            <button
              key={themeName}
              className={`theme-selector__button ${currentTheme === themeName ? 'active' : ''}`}
              onClick={() => changeTheme(themeName)}
              title={themeDisplayNames[themeName]}
              aria-label={`Switch to ${themeDisplayNames[themeName]} theme`}
            >
              <span className="theme-selector__icon">
                {themeIcons[themeName]}
              </span>
              <span className="theme-selector__name">
                {themeDisplayNames[themeName]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
