import { useEffect, useState } from 'react';
import { readNotesListState, saveNotesListState } from '../notes-list-state';

export function useNotesListPreferences() {
  const [initialNotesListState] = useState(readNotesListState);
  const [layout, setLayout] = useState(initialNotesListState.layout);
  const [sort, setSort] = useState(initialNotesListState.sort);
  useEffect(() => { saveNotesListState({ layout, sort }); }, [layout, sort]);
  return { layout, setLayout, sort, setSort };
}
export type NotesListPreferences = ReturnType<typeof useNotesListPreferences>;
