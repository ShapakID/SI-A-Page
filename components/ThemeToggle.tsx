'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('si_a_theme', next ? 'dark' : 'light');
    } catch {
      // storage blocked, theme still applies for this page
    }
  };

  return (
    <button
      onClick={toggle}
      title={dark ? 'Mode terang' : 'Mode gelap'}
      aria-label={dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      className="p-1.5 rounded-md border border-hairline text-ink-muted hover:text-ink hover:bg-canvas-subtle transition-colors"
    >
      {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  );
}
