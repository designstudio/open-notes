import { calcAPCA } from 'apca-w3';

export const palettes = [
  { id: 'neutral', name: 'Neutro', gradient: 'var(--palette-swatch-neutral-bg)' },
  { id: 'blue', name: 'Azul', gradient: 'var(--palette-swatch-blue-bg)' },
  { id: 'aurora', name: 'Aurora', gradient: 'var(--palette-swatch-aurora-bg)' },
  { id: 'mint', name: 'Menta', gradient: 'var(--palette-swatch-mint-bg)' },
  { id: 'rose', name: 'Rosa', gradient: 'var(--palette-swatch-rose-bg)' },
  { id: 'peach', name: 'Pêssego', gradient: 'var(--palette-swatch-peach-bg)' },
] as const;

export type Palette = typeof palettes[number]['id'] | 'custom';
export function normalizeHex(value: string): string | null {
  const hex = value.trim().replace(/^#/, '');
  if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) return null;
  return '#' + (hex.length === 3 ? [...hex].map(char => char + char).join('') : hex).toUpperCase();
}
export function readCustomAccent(): string {
  try { return normalizeHex(localStorage.getItem('open-notes-custom-accent') ?? '') ?? '#0D0D0D'; }
  catch { return '#0D0D0D'; }
}
export function accentTextColor(hex: string): string {
  const background = normalizeHex(hex) ?? '#0D0D0D';
  const blackContrast = Math.abs(calcAPCA('#000000', background));
  const whiteContrast = Math.abs(calcAPCA('#FFFFFF', background));
  return blackContrast >= whiteContrast ? '#000000' : '#FFFFFF';
}
export function readPalette(): Palette {
  try {
    const value = localStorage.getItem('open-notes-palette');
    return value === 'custom' ? 'custom' : palettes.find(palette => palette.id === value)?.id ?? 'neutral';
  } catch { return 'neutral'; }
}
