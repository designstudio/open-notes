import { SearchDialogContent } from './SearchDialogContent';
import { type AppData, type Notebook, type Folder as FolderType } from '../data';
import { Plus, X } from '../icons';
import { AnimatedDialog } from '../AnimatedDialog';
import { IconButton } from '../IconButton';
import { CollectionNoteDefaults } from '../CollectionNoteDefaults';
import { Preferences } from '../Preferences';
import { readProfile } from '../profile';
import type { GoogleDriveSync } from '../cloud/use-google-drive-sync';
import type { AppDialogsState } from './use-app-dialogs';
import type { Appearance } from './use-appearance';
import type { Navigation, SetAppData } from './types';
import type { Workspace } from './workspace-selectors';
import type { Notify } from './use-toasts';

type AppDialogsProps = {
  data: AppData;
  setData: SetAppData;
  view: string;
  dialogs: AppDialogsState;
  appearance: Appearance;
  navigation: Navigation;
  workspace: Workspace;
  driveSync: GoogleDriveSync;
  setToast: Notify;
};

export function AppDialogs({ data, setData, view, dialogs, appearance, navigation, workspace, driveSync, setToast }: AppDialogsProps) {
  const { modal, setModal, collectionName, setCollectionName, collectionDescription, setCollectionDescription, collectionNoteDefaults, setCollectionNoteDefaults, editingCollection, setEditingCollection, targetCollectionForFolder, setTargetCollectionForFolder, editingFolder, setEditingFolder, folderName, setFolderName } = dialogs;
  const { theme, setTheme, palette, setPalette, customAccent, setCustomAccent } = appearance;
  const { openNote, openCollection } = navigation;
  const profile = readProfile(data.profile);
  const currentCollection = data.collections.find(c => c.id === view);
  return (
    <AnimatedDialog open={modal !== null} onDismiss={() => setModal(null)} className={modal === 'search' ? 'search-dialog' : modal === 'settings' ? 'settings-dialog' : ''} aria-labelledby="dialog-title" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
    {modal !== 'search' && modal !== 'settings' && <div className="dialog-header"><h2 id="dialog-title">{modal === 'collection' ? 'Nova coleção' : modal === 'collection-settings' ? 'Editar coleção' : modal === 'new-folder' ? 'Nova pasta' : modal === 'edit-folder' ? 'Renomear pasta' : 'Preferências'}</h2><IconButton className="icon-button" aria-label="Fechar" onClick={() => setModal(null)}><X size={19} /></IconButton></div>}
    {modal === 'collection' && (
      <form className="collection-settings-form" onSubmit={e => {
        e.preventDefault();
        if (!collectionName.trim()) return;
        const collection: Notebook = {
          id: crypto.randomUUID(),
          name: collectionName.trim(),
          description: collectionDescription.trim(),
          noteDefaults: collectionNoteDefaults,
          createdAt: Date.now(),
          color: ['sage', 'blue', 'amber'][data.collections.length % 3],
        };
        setData(d => ({ ...d, collections: [collection, ...d.collections] }));
        setCollectionName('');
        setCollectionDescription('');
        setModal(null);
        openCollection(collection.id);
      }}>
        <label htmlFor="collection-name">Nome da coleção</label>
        <input id="collection-name" autoFocus maxLength={40} value={collectionName} onChange={e => setCollectionName(e.target.value)} placeholder="Ex.: Meu próximo projeto" required />
        <label htmlFor="collection-description">Descrição da coleção</label>
        <textarea id="collection-description" maxLength={180} rows={2} value={collectionDescription} onChange={e => setCollectionDescription(e.target.value)} placeholder="Explique o que você organiza nesta coleção" />
        <CollectionNoteDefaults value={collectionNoteDefaults} onChange={setCollectionNoteDefaults} />
        <div className="collection-settings-footer">
          <button className="primary-button" type="submit"><Plus size={15} />Criar coleção</button>
        </div>
      </form>
    )}
    {modal === 'collection-settings' && editingCollection && (
      <form className="collection-settings-form" onSubmit={e => {
        e.preventDefault();
        const updatedName = collectionName.trim();
        if (!updatedName) return;
        const updatedDescription = collectionDescription.trim();
        setData(d => ({
          ...d,
          collections: d.collections.map(collection => collection.id === editingCollection.id
            ? { ...collection, name: updatedName, description: updatedDescription, noteDefaults: collectionNoteDefaults }
            : collection),
        }));
        setEditingCollection(null);
        setCollectionName('');
        setCollectionDescription('');
        setModal(null);
        setToast('Coleção atualizada');
      }}>
        <label htmlFor="edit-collection-name">Nome da coleção</label>
        <input
          id="edit-collection-name"
          autoFocus
          maxLength={40}
          value={collectionName}
          onChange={e => setCollectionName(e.target.value)}
          placeholder="Nome da coleção"
          required
        />
        <label htmlFor="edit-collection-description">Descrição da coleção</label>
        <textarea
          id="edit-collection-description"
          maxLength={180}
          rows={2}
          value={collectionDescription}
          onChange={e => setCollectionDescription(e.target.value)}
          placeholder="Explique o que você organiza nesta coleção"
        />
        <CollectionNoteDefaults value={collectionNoteDefaults} onChange={setCollectionNoteDefaults} />
        <div className="collection-settings-footer">
          <button className="primary-button" type="submit">Salvar alterações</button>
        </div>
      </form>
    )}
    {modal === 'new-folder' && (
      <form onSubmit={e => {
        e.preventDefault();
        if (!folderName.trim()) return;
        const targetCol = targetCollectionForFolder || currentCollection?.id || data.collections[0]?.id;
        if (!targetCol) return;
        const colName = data.collections.find(c => c.id === targetCol)?.name;
        const f: FolderType = {
          id: crypto.randomUUID(),
          name: folderName.trim(),
          collectionId: targetCol,
        };
        setData(d => ({ ...d, folders: [...d.folders, f] }));
        setFolderName('');
        setModal(null);
        openCollection(targetCol, f.id);
        setToast(`Pasta “${f.name}” criada em ${colName}`);
      }}>
        <p>
          {currentCollection
            ? <>Organize as notas da coleção <strong>{currentCollection.name}</strong>.</>
            : <>Escolha a coleção e dê um nome para a pasta.</>
          }
        </p>
        {!currentCollection && (
          <div style={{ marginBottom: 'var(--space-14)' }}>
            <label htmlFor="target-folder-col">Coleção</label>
            <select
              id="target-folder-col"
              value={targetCollectionForFolder || data.collections[0]?.id || ''}
              onChange={e => setTargetCollectionForFolder(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-9) var(--space-12)',
                borderRadius: 'var(--input-radius)',
                border: '1px solid var(--input-border)',
                background: 'var(--input-bg)',
                color: 'var(--input-text)',
                fontSize: 'var(--font-size-14)',
                marginTop: 'var(--space-6)'
              }}
            >
              {data.collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        <label htmlFor="new-folder-name">Nome da pasta</label>
        <input
          id="new-folder-name"
          autoFocus
          maxLength={40}
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          placeholder="Ex.: Projetos, Reuniões, Leituras..."
          required
        />
        <button className="primary-button" type="submit">
          <Plus size={16} />Criar pasta
        </button>
      </form>
    )}
    {modal === 'edit-folder' && editingFolder && (
      <form onSubmit={e => {
        e.preventDefault();
        if (!folderName.trim()) return;
        const updatedName = folderName.trim();
        setData(d => ({
          ...d,
          folders: d.folders.map(f => f.id === editingFolder.id ? { ...f, name: updatedName } : f)
        }));
        setEditingFolder(null);
        setFolderName('');
        setModal(null);
        setToast(`Pasta renomeada para “${updatedName}”`);
      }}>
        <label htmlFor="edit-folder-name">Nome da pasta</label>
        <input
          id="edit-folder-name"
          autoFocus
          maxLength={40}
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          placeholder="Nome da pasta"
          required
        />
        <button className="primary-button" type="submit">
          Salvar alterações
        </button>
      </form>
    )}
    {modal === 'search' && <SearchDialogContent data={data} dialogs={dialogs} workspace={workspace} openNote={openNote} />}
    {modal === 'settings' && <Preferences profile={profile} onProfileUpdate={patch => setData(current => ({ ...current, profile: { ...readProfile(current.profile), ...patch } }))} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} palette={palette} onPaletteChange={setPalette} customAccent={customAccent} onCustomAccentChange={color => { setCustomAccent(color); setPalette('custom'); }} onDismiss={() => setModal(null)} sync={driveSync} />}
    </AnimatedDialog>
  );
}
