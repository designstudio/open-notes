import { useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal, SquarePen, Trash2 } from './icons';
import { AnimatedDialog } from './AnimatedDialog';
import type { Folder } from './data';

export function FolderActions({
  folder,
  onRename,
  onDelete,
}: {
  folder: Folder;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const deleting = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closedWithPointer = useRef(false);

  function close() {
    setConfirming(false);
  }

  return (
    <>
      <DropdownMenu.Root modal={false} onOpenChange={open => { if (open) closedWithPointer.current = false; }}>
        <DropdownMenu.Trigger asChild>
          <button
            ref={trigger}
            className="icon-button folder-more"
            aria-label={`Opções da pasta ${folder.name}`}
            onClick={e => e.stopPropagation()}
          >
            <MoreHorizontal size={15} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="collection-menu t-dropdown"
            align="start"
            sideOffset={8}
            collisionPadding={12}
            onPointerDownOutside={() => { closedWithPointer.current = true; }}
            onEscapeKeyDown={() => { closedWithPointer.current = false; }}
            onCloseAutoFocus={e => { if (confirming || closedWithPointer.current) e.preventDefault(); }}
          >
            <DropdownMenu.Item
              className="note-action"
              onSelect={() => {
                setTimeout(onRename, 50);
              }}
            >
              <SquarePen size={16} />
              <span>Renomear pasta</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="collection-delete-item"
              onSelect={() => setConfirming(true)}
            >
              <Trash2 size={16} />
              <span>Excluir pasta</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <AnimatedDialog
        open={confirming}
        onDismiss={close}
        onAfterClose={() => { if (deleting.current) onDelete(); else trigger.current?.focus(); }}
        className="collection-alert"
        role="alertdialog"
        aria-labelledby={`delete-folder-title-${folder.id}`}
        aria-describedby={`delete-folder-description-${folder.id}`}
      >
        <h2 id={`delete-folder-title-${folder.id}`}>Excluir “{folder.name}”?</h2>
        <p id={`delete-folder-description-${folder.id}`}>
          A pasta será excluída, mas as notas continuarão salvas nesta coleção (sem pasta vinculada).
          Esta ação não pode ser desfeita.
        </p>
        <div className="collection-alert-actions">
          <button autoFocus className="secondary-button" onClick={close}>
            Cancelar
          </button>
          <button
            className="destructive-button"
            onClick={() => {
              deleting.current = true;
              setConfirming(false);
            }}
          >
            Excluir pasta
          </button>
        </div>
      </AnimatedDialog>
    </>
  );
}
