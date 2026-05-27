import { useState, useEffect, useCallback } from 'react';

/**
 * Hook de theming (claro/oscuro).
 * Persiste en localStorage y togglea la clase `dark` en <html>.
 *
 * @returns {{ theme: 'light'|'dark', toggle: () => void, isDark: boolean }}
 */
export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    // Sin preferencia guardada → usar sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    root.style.colorScheme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle, isDark: theme === 'dark' };
}
