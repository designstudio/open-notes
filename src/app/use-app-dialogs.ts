import { useEffect, useState } from 'react';
import type { NoteDefaults, Notebook, Folder as FolderType } from '../data';

export function useAppDialogs() {
  const [modal, setModal] = useState<'collection' | 'collection-settings' | 'search' | 'settings' | 'new-folder' | 'edit-folder' | null>(null);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [collectionNoteDefaults, setCollectionNoteDefaults] = useState<NoteDefaults>({});
  const [editingCollection, setEditingCollection] = useState<Notebook | null>(null);
  const [targetCollectionForFolder, setTargetCollectionForFolder] = useState('');
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [folderName, setFolderName] = useState('');
  const [modalSearch, setModalSearch] = useState('');
  const [searchScrolled, setSearchScrolled] = useState(false);
  function openSearch() {
    setModalSearch('');
    setSearchScrolled(false);
    setModal('search');
  }
  function openNewCollection() {
    setEditingCollection(null);
    setCollectionName('');
    setCollectionDescription('');
    setCollectionNoteDefaults({});
    setModal('collection');
  }
  function openCollectionSettings(collection: Notebook) {
    setEditingCollection(collection);
    setCollectionName(collection.name);
    setCollectionDescription(collection.description || '');
    setCollectionNoteDefaults({ ...collection.noteDefaults });
    setModal('collection-settings');
  }
  function openNewFolder(collectionId: string) {
    setTargetCollectionForFolder(collectionId);
    setFolderName('');
    setModal('new-folder');
  }
  function openRenameFolder(folder: FolderType) {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setModal('edit-folder');
  }
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        openSearch();
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  return { modal, setModal, collectionName, setCollectionName, collectionDescription, setCollectionDescription, collectionNoteDefaults, setCollectionNoteDefaults, editingCollection, setEditingCollection, targetCollectionForFolder, setTargetCollectionForFolder, editingFolder, setEditingFolder, folderName, setFolderName, modalSearch, setModalSearch, searchScrolled, setSearchScrolled, openSearch, openNewCollection, openCollectionSettings, openNewFolder, openRenameFolder };
}
export type AppDialogsState = ReturnType<typeof useAppDialogs>;
