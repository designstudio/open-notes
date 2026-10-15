import { useLayoutEffect, useRef } from 'react';

// Color emoji font metrics can include invisible padding. Center the painted pixels.
export function NoteEmoji({ value, size = 28, opticalOffset = true }: { value: string; size?: number; opticalOffset?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(size * ratio);
    canvas.height = Math.round(size * ratio);
    const source = document.createElement('canvas');
    source.width = source.height = 96 * ratio;
    const sourceContext = source.getContext('2d');
    if (!sourceContext) return;
    sourceContext.font = `${(size - 2) * ratio}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    sourceContext.fillText(value, Math.round(32 * ratio), Math.round(64 * ratio));
    const pixels = sourceContext.getImageData(0, 0, source.width, source.height).data;
    let left = source.width, top = source.height, right = -1, bottom = -1;
    for (let y = 0; y < source.height; y++) {
      for (let x = 0; x < source.width; x++) {
        if (pixels[(y * source.width + x) * 4 + 3] <= 8) continue;
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
    if (right < left) return;
    const width = right - left + 1, height = bottom - top + 1;
    const scale = Math.min(1, canvas.width / width, canvas.height / height);
    context.drawImage(source, left, top, width, height,
      Math.round((canvas.width - width * scale) / 2), Math.round((canvas.height - height * scale) / 2),
      width * scale, height * scale);
  }, [value, size]);
  return <canvas ref={ref} className="note-emoji-glyph" data-optical-offset={opticalOffset && value === '📝'} width={size} height={size} style={{ width: size, height: size }} aria-hidden="true" />;
}
