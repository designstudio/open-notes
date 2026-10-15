import { useEffect, useLayoutEffect, useState } from 'react';
import { accentTextColor, readCustomAccent, readPalette, type Palette } from '../themes';

export function useAppearance() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('open-notes-theme') || 'light'; } catch { return 'light'; } });
  const [palette, setPalette] = useState<Palette>(readPalette);
  const [customAccent, setCustomAccent] = useState(readCustomAccent);
  useLayoutEffect(() => {
    const root = document.documentElement;
    // Commit theme colors together before paint, then restore normal hover motion.
    root.classList.add('theme-changing');
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    void root.offsetHeight;
    root.classList.remove('theme-changing');
    try { localStorage.setItem('open-notes-theme', theme); } catch { /* Theme still works for this session. */ }
  }, [theme]);
  useEffect(() => {
    document.documentElement.style.setProperty('--custom-accent', customAccent);
    document.documentElement.style.setProperty('--custom-accent-text', accentTextColor(customAccent));
    try { localStorage.setItem('open-notes-custom-accent', customAccent); } catch { /* Color still works for this session. */ }
  }, [customAccent]);
  useEffect(() => {
    document.documentElement.dataset.palette = palette;
    try { localStorage.setItem('open-notes-palette', palette); } catch { /* The palette still works for this session. */ }
  }, [palette]);
  return { theme, setTheme, palette, setPalette, customAccent, setCustomAccent };
}
export type Appearance = ReturnType<typeof useAppearance>;
