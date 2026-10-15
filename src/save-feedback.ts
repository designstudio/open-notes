import type { Note, UserProfile } from './data';

export function noteSaveStatus(note: Note | undefined, savedNote: Note | undefined, failed: boolean) {
  if (!note || note === savedNote) return 'saved';
  if (savedNote && note.updated === savedNote.updated && note.body === savedNote.body &&
    note.title === savedNote.title && JSON.stringify(note) === JSON.stringify(savedNote)) return 'saved';
  return failed ? 'error' : 'saving';
}

export function profileSaveMessage(profile: UserProfile, savedProfile: UserProfile): string | null {
  const photoChanged = profile.photo !== savedProfile.photo;
  const nameChanged = profile.name !== savedProfile.name;
  if (photoChanged && nameChanged) return 'Perfil atualizado';
  if (photoChanged) return 'Foto atualizada';
  if (nameChanged) return 'Nome atualizado';
  return null;
}
