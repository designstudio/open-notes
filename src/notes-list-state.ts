const STORAGE_KEY = 'open-notes-list-state';

export type NotesLayout = 'list' | 'grid';
export type NotesSort = 'recent' | 'title';
type NotesListState = { layout: NotesLayout; sort: NotesSort };

export function readNotesListState(): NotesListState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return {
      layout: saved?.layout === 'grid' ? 'grid' : 'list',
      sort: saved?.sort === 'title' ? 'title' : 'recent',
    };
  } catch {
    return { layout: 'list', sort: 'recent' };
  }
}

export function saveNotesListState(state: NotesListState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* Controls remain usable without local storage. */ }
}
