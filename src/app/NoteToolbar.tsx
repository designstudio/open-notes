import type { Dispatch, SetStateAction } from 'react';
import { type AppData, type Note, relativeTime } from '../data';
import { Check, Menu, Search, X } from '../icons';
import { IconButton } from '../IconButton';
import { NoteActions } from '../NoteActions';
import { FavoriteButton } from '../FavoriteButton';
import { ExportMenu } from '../ExportMenu';
import { TextSwap } from '../Feedback';
import type { noteSaveStatus } from '../save-feedback';
import type { Navigation, UpdateNote } from './types';

type NoteToolbarProps = {
  data: AppData;
  note: Note;
  saveStatus: ReturnType<typeof noteSaveStatus>;
  findOpen: boolean;
  setFindOpen: Dispatch<SetStateAction<boolean>>;
  openCollection: Navigation['openCollection'];
  onOpenSidebar: () => void;
  onUpdate: UpdateNote;
  onDelete: (id: string) => void;
  onNewFolder: (collectionId: string) => void;
  onExportMarkdown: (note: Note) => void;
  onExportPdf: (note: Note) => void;
};

export function NoteToolbar({ data, note, saveStatus, findOpen, setFindOpen, openCollection, onOpenSidebar, onUpdate, onDelete, onNewFolder, onExportMarkdown, onExportPdf }: NoteToolbarProps) {
  return (
      <header className="topbar">
        <div className="breadcrumb">
          <IconButton className="icon-button mobile-menu" aria-label="Abrir menu" onClick={onOpenSidebar}><Menu size={19} /></IconButton>
          <span className="breadcrumb-current">
            {(() => {
              const noteCol = data.collections.find(c => c.id === note.collection);
              const noteFld = data.folders.find(f => f.id === note.folder);
              return (
                <>
                  {noteCol && (
                    <>
                      <button
                        type="button"
                        className="breadcrumb-link"
                        onClick={() => openCollection(noteCol.id)}
                      >
                        {noteCol.name}
                      </button>
                      <span className="breadcrumb-sep">/</span>
                    </>
                  )}
                  {noteFld && (
                    <>
                      <button
                        type="button"
                        className="breadcrumb-link"
                        onClick={() => openCollection(noteCol!.id, noteFld.id)}
                      >
                        {noteFld.name}
                      </button>
                      <span className="breadcrumb-sep">/</span>
                    </>
                  )}
                  <span>{note.title || 'Sem título'}</span>
                </>
              );
            })()}
          </span>
        </div>
        <div className="topbar-right">
          <span className={`save-status ${saveStatus === 'error' ? 'error' : ''}`} role="status" aria-live="polite" title={saveStatus === 'saved' ? `Última atualização: ${new Date(note.updated).toLocaleString('pt-BR')}` : undefined}>
            {saveStatus === 'error' ? <X size={14} /> : saveStatus === 'saving' ? <span className="saving-indicator" aria-hidden="true" /> : <Check size={14} />}
            <TextSwap text={saveStatus === 'error' ? 'Falha ao salvar — exporte sua nota' : saveStatus === 'saving' ? 'Salvando…' : `Atualizado ${relativeTime(note.updated).toLowerCase()}`} />
          </span>
          <div className="editor-actions">
            <IconButton className="icon-button" aria-label="Buscar nesta nota" title="Buscar nesta nota (Ctrl+F)" aria-expanded={findOpen} onClick={() => setFindOpen(value => !value)}><Search size={18} /></IconButton>
            <FavoriteButton key={`favorite-${note.id}`} favorite={note.favorite} onChange={favorite => onUpdate(note.id, { favorite })} />
            <ExportMenu onMarkdown={() => onExportMarkdown(note)} onPdf={() => onExportPdf(note)} />
            {!note.deleted && (
              <NoteActions
                key={`actions-${note.id}`}
                note={note}
                collections={data.collections}
                folders={data.folders}
                onUpdate={patch => onUpdate(note.id, patch)}
                onDelete={() => onDelete(note.id)}
                onNewFolder={onNewFolder}
              />
            )}
          </div>
        </div>
      </header>

  );
}
