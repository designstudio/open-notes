import type { Note, NoteDefaults } from './data';

export function noteFieldPatch(field: 'cover' | 'icon' | 'subtitle', enabled: boolean): Partial<Note> {
  if (field === 'cover') return {
    showCover: enabled,
    cover: undefined,
    coverGradient: enabled ? 'coast' : undefined,
    coverPosition: undefined,
  };
  if (field === 'icon') return { showPageIcon: enabled, pageIcon: enabled ? '📝' : undefined };
  return { showSubtitle: enabled, subtitle: enabled ? '' : undefined };
}

export function newNoteFieldDefaults(defaults?: NoteDefaults): Partial<Note> {
  if (!defaults) return {};
  return {
    ...noteFieldPatch('cover', defaults.showCover === true),
    ...noteFieldPatch('icon', defaults.showPageIcon === true),
    ...noteFieldPatch('subtitle', defaults.showSubtitle === true),
    showOutline: defaults.showOutline !== false,
    pageWidth: defaults.pageWidth ?? 'narrow',
  };
}
