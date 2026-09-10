import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }

    return 'system';
  });

  const setTheme = (newTheme: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
      window.dispatchEvent(
        new CustomEvent('theme-change', { detail: newTheme }),
      );
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (t: Theme) => {
      const isDark =
        t === 'dark' ||
        (t === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      const nextTheme =
        customEvent.detail ||
        (localStorage.getItem('theme') as Theme) ||
        'system';
      setThemeState(nextTheme);
    };

    window.addEventListener('theme-change', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, [theme]);

  return { theme, setTheme };
}
