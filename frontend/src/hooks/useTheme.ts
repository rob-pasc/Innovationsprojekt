import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * useTheme Hook
 * 
 * Manages light/dark theme preference and applies it to the DOM.
 * Respects system preference if 'system' is selected.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get from localStorage or default to 'system'
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme = theme;

    // If system, check media preference
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    // Apply to DOM
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return 'dark'; // system → dark
    });
  };

  return { theme, setTheme, toggleTheme };
}
