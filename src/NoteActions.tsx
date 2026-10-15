import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Archive, Unarchive, Check, ChevronDown, FileText, Folder, MoreHorizontal, Plus, Trash2, X } from './icons';
import type { Folder as FolderType, Note, Notebook } from './data';
import { IconButton } from './IconButton';
import { TextSwap } from './Feedback';
import './note-actions.css';

export function NoteActions({
  note,
  collections,
  folders = [],
  onUpdate,
  onDelete,
  onNewFolder,
}: {
  note: Note;
  collections: Notebook[];
  folders?: FolderType[];
  onUpdate: (patch: Partial<Note>) => void;
  onDelete: () => void;
  onNewFolder?: (collectionId: string) => void;
}) {
  const collection = collections.find(item => item.id === note.collection);
  const collectionFolders = collection ? folders.filter(f => f.collectionId === collection.id) : [];
  const currentFolder = collectionFolders.find(f => f.id === note.folder);

  return <DropdownMenu.Root modal={false}>
    <DropdownMenu.Trigger asChild>
      <IconButton className="icon-button" aria-label="Ações da nota" title="Mais"><MoreHorizontal size={18} /></IconButton>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content className="note-actions-menu t-dropdown" align="end" sideOffset={10} collisionPadding={12}>
        <DropdownMenu.Item className="note-action" onSelect={() => onUpdate({ archived: !note.archived })}>
          {note.archived ? <Unarchive size={18} /> : <Archive size={18} />}<span><TextSwap text={note.archived ? 'Desarquivar' : 'Arquivar'} /></span>
        </DropdownMenu.Item>
        <DropdownMenu.Item className="note-action danger" onSelect={onDelete}>
          <Trash2 size={18} /><span>Mover para a lixeira</span>
        </DropdownMenu.Item>
        <DropdownMenu.Separator className="note-actions-separator" />
        {collection && <DropdownMenu.Label className="note-actions-label">{collection.name}{currentFolder ? ` / ${currentFolder.name}` : ''}</DropdownMenu.Label>}
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger className="note-action">
            <Folder size={18} /><span>Mover para coleção</span><ChevronDown size={14} className="note-actions-chevron" />
          </DropdownMenu.SubTrigger>
          <DropdownMenu.Portal>
            <DropdownMenu.SubContent className="note-actions-menu note-collections-menu t-dropdown" sideOffset={8} collisionPadding={12}>
              <DropdownMenu.Label className="note-actions-label">Coleções</DropdownMenu.Label>
              {collections.length === 0 ? <DropdownMenu.Item className="note-action" disabled>Nenhuma coleção criada</DropdownMenu.Item> :
                <DropdownMenu.RadioGroup value={note.collection} onValueChange={id => { if (id !== note.collection) onUpdate({ collection: id, folder: '' }); }}>
                  {collections.map(item => <DropdownMenu.RadioItem key={item.id} value={item.id} className="note-action">
                    <Folder size={17} /><span>{item.name}</span><DropdownMenu.ItemIndicator><Check size={15} /></DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>)}
                </DropdownMenu.RadioGroup>}
            </DropdownMenu.SubContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Sub>
        {collection && (
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="note-action">
              <Folder size={18} /><span><TextSwap text={currentFolder ? `Pasta: ${currentFolder.name}` : 'Mover para pasta'} /></span><ChevronDown size={14} className="note-actions-chevron" />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className="note-actions-menu note-collections-menu t-dropdown" sideOffset={8} collisionPadding={12}>
                <DropdownMenu.Label className="note-actions-label">Pastas em {collection.name}</DropdownMenu.Label>
                {collectionFolders.length === 0 ? (
                  <DropdownMenu.Item className="note-action" disabled>Nenhuma pasta criada</DropdownMenu.Item>
                ) : (
                  collectionFolders.map(item => (
                    <DropdownMenu.CheckboxItem
                      key={item.id}
                      checked={note.folder === item.id}
                      onCheckedChange={checked => {
                        onUpdate({ folder: checked ? item.id : '' });
                      }}
                      className="note-action"
                    >
                      <Folder size={17} />
                      <span>{item.name}</span>
                      <DropdownMenu.ItemIndicator><Check size={15} /></DropdownMenu.ItemIndicator>
                    </DropdownMenu.CheckboxItem>
                  ))
                )}
                {onNewFolder && (
                  <>
                    <DropdownMenu.Separator className="note-actions-separator" />
                    <DropdownMenu.Item className="note-action" onSelect={() => onNewFolder(collection.id)}>
                      <Plus size={16} /><span>Nova pasta...</span>
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        )}
        {collection && <DropdownMenu.Item className="note-action" onSelect={() => onUpdate({ collection: '', folder: '' })}>
          <X size={18} /><span>Remover da coleção</span>
        </DropdownMenu.Item>}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>;
}
