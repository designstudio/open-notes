import type { Dispatch, SetStateAction } from 'react';
import type { AppData, Note, Notebook } from '../data';
import type { HistoryMode } from './navigation';

export type SetAppData = Dispatch<SetStateAction<AppData>>;
export type UpdateNote = (id: string, patch: Partial<Note>) => void;
export type Navigation = {
  navigate: (view: string, mode?: HistoryMode) => void;
  openNote: (id: string, mode?: HistoryMode) => void;
  openCollection: (id: string, folderId?: string | null, mode?: HistoryMode) => void;
};
export type CollectionCommands = {
  openNewCollection: () => void;
  openCollectionSettings: (collection: Notebook) => void;
  deleteCollection: (collection: Notebook) => void;
  toggleCollectionPin: (collection: Notebook) => void;
  toggleCollectionArchive: (collection: Notebook) => void;
};
