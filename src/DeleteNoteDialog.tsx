import { useId, useLayoutEffect, useRef } from 'react';
import { AnimatedDialog } from './AnimatedDialog';
import { IconButton } from './IconButton';
import { X } from './icons';
import './delete-note-dialog.css';

export function DeleteNoteDialog({ open, title, onDismiss, onDelete }: {
  open: boolean;
  title: string;
  onDismiss: () => void;
  onDelete: () => void;
}) {
  const id = useId();
  const deleting = useRef(false);
  const cancelButton = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (open) cancelButton.current?.focus();
  }, [open]);
  return <AnimatedDialog open={open} onDismiss={onDismiss}
    onAfterClose={() => {
      if (!deleting.current) return;
      deleting.current = false;
      onDelete();
    }}
    className="note-delete-dialog" role="alertdialog"
    aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
    <div className="note-delete-dialog-header">
      <div>
        <h2 id={`${id}-title`}>Excluir nota permanentemente?</h2>
        <p id={`${id}-description`}>A nota “{title || 'Sem título'}” será excluída permanentemente. Esta ação não pode ser desfeita.</p>
      </div>
      <IconButton className="icon-button" aria-label="Fechar confirmação" onClick={onDismiss}><X size={18} /></IconButton>
    </div>
    <div className="note-delete-dialog-actions">
      <button ref={cancelButton} autoFocus type="button" className="secondary-button" onClick={onDismiss}>Cancelar</button>
      <button type="button" className="destructive-button" onClick={() => {
        if (deleting.current) return;
        deleting.current = true;
        onDismiss();
      }}>Excluir permanentemente</button>
    </div>
  </AnimatedDialog>;
}
