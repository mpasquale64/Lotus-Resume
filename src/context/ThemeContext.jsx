import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
    // Get system theme on mount
    if (window.lotus) {
      window.lotus.getSystemTheme().then((systemTheme) => {
        if (!manualOverride) setTheme(systemTheme);
      });

      const cleanup = window.lotus.onSystemThemeChanged((systemTheme) => {
        if (!manualOverride) setTheme(systemTheme);
      });
      return cleanup;
    }
  }, [manualOverride]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setManualOverride(true);
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
