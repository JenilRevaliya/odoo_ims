'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When mounting on client, ensure the class is correctly applied to html
  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    const currentTheme = theme === 'system' ? systemTheme : theme;
    
    // Explicitly add/remove classes and data attributes to be extra sure
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme, systemTheme, mounted]);

  return <>{children}</>;
}
