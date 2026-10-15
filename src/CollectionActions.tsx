import { useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Archive, MoreHorizontal, Pin, Unpin, Unarchive, Settings2, Trash2 } from './icons';
import { AnimatedDialog } from './AnimatedDialog';
import type { Notebook } from './data';

export function CollectionActions({
  collection,
  onDelete,
  onSettings,
  onTogglePin,
  onToggleArchive,
  placement = 'sidebar',
}: {
  collection: Notebook;
  onDelete: () => void;
  onSettings?: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  placement?: 'sidebar' | 'page';
}) {
  const [confirming, setConfirming] = useState(false);
  const deleting = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closedWithPointer = useRef(false);
  function close() { setConfirming(false); }
  return <>
    <DropdownMenu.Root modal={false} onOpenChange={open => { if (open) closedWithPointer.current = false; }}>
      <DropdownMenu.Trigger asChild>
        <button
          ref={trigger}
          className={`icon-button ${placement === 'page' ? 'collection-page-more' : 'collection-more'}`}
          aria-label={`Opções da coleção ${collection.name}`}
        >
          <MoreHorizontal size={17} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="collection-menu t-dropdown" align={placement === 'page' ? 'end' : 'start'} sideOffset={10} collisionPadding={12} onPointerDownOutside={() => { closedWithPointer.current = true; }} onEscapeKeyDown={() => { closedWithPointer.current = false; }} onCloseAutoFocus={e => { if (confirming || closedWithPointer.current) e.preventDefault(); }}>
          {onSettings && <DropdownMenu.Item className="note-action" onSelect={() => setTimeout(onSettings, 50)}><Settings2 size={17} /><span>Editar coleção</span></DropdownMenu.Item>}
          <DropdownMenu.Item className="note-action" onSelect={onTogglePin}>{collection.pinned ? <Unpin size={17} /> : <Pin size={17} />}<span>{collection.pinned ? 'Desafixar' : 'Fixar'}</span></DropdownMenu.Item>
          <DropdownMenu.Separator className="note-actions-separator" />
          <DropdownMenu.Item className="note-action" onSelect={onToggleArchive}>{collection.archived ? <Unarchive size={17} /> : <Archive size={17} />}<span>{collection.archived ? 'Desarquivar' : 'Arquivar'}</span></DropdownMenu.Item>
          <DropdownMenu.Item className="collection-delete-item" onSelect={() => setConfirming(true)}><Trash2 size={17} /><span>Excluir coleção</span></DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
    <AnimatedDialog open={confirming} onDismiss={close} onAfterClose={() => { if (deleting.current) onDelete(); else trigger.current?.focus(); }} className="collection-alert" role="alertdialog" aria-labelledby={`delete-title-${collection.id}`} aria-describedby={`delete-description-${collection.id}`}>
      <h2 id={`delete-title-${collection.id}`}>Excluir “{collection.name}”?</h2>
      <p id={`delete-description-${collection.id}`}>A coleção será excluída permanentemente. Suas notas serão preservadas, sem coleção. Notas arquivadas ou na lixeira continuarão nesses locais. Esta ação não pode ser desfeita.</p>
      <div className="collection-alert-actions"><button autoFocus className="secondary-button" onClick={close}>Cancelar</button><button className="destructive-button" onClick={() => { deleting.current = true; setConfirming(false); }}>Excluir coleção</button></div>
    </AnimatedDialog>
  </>;
}
