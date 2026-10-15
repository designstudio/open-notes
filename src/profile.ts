import type { UserProfile } from './data';

export const emptyProfile: UserProfile = { name: '', photo: '' };
export function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as UserProfile;
  return typeof profile.name === 'string' && profile.name.length <= 80
    && typeof profile.photo === 'string' && profile.photo.length <= 400000
    && (!profile.photo || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(profile.photo));
}
export function readProfile(value: unknown): UserProfile {
  return isUserProfile(value) ? { name: value.name.trim(), photo: value.photo } : emptyProfile;
}
export function profileInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length ? [words[0], ...(words.length > 1 ? [words.at(-1)!] : [])]
    .map(word => Array.from(word)[0]).join('').toLocaleUpperCase('pt-BR') : 'EU';
}

export async function prepareProfilePhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Escolha uma foto JPG, PNG ou WebP.');
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('Escolha uma foto de até 10 MB.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try { await image.decode(); }
    catch { throw new Error('Não foi possível abrir essa foto. Escolha outra imagem.'); }
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível preparar a foto.');
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    context.fillStyle = '#fff';
    context.fillRect(0, 0, 256, 256);
    context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 256, 256);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally { URL.revokeObjectURL(url); }
}
