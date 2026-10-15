import { useEffect, useId, useState } from 'react';
import type { GoogleDriveSync } from './cloud/use-google-drive-sync';
import { AlertTriangle, Check, FolderCloud, Refresh, ShieldTick } from './icons';
import googleDriveIcon from './assets/google-drive.svg';
import { recoveryCopies, type RecoveryCopy } from './cloud/recovery-storage';
import { TextSwap } from './Feedback';
import './cloud-storage.css';

function ConnectedStatusIcon() {
  return <span className="cloud-state-icon is-connected" aria-hidden="true"><Check size={13} /></span>;
}

function statusCopy(sync: GoogleDriveSync) {
  if (sync.status === 'connecting') return 'Aguardando autorização do Google…';
  if (sync.status === 'syncing') return sync.lastSyncedAt
    ? `Sincronizado às ${new Date(sync.lastSyncedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : 'Aguardando a primeira sincronização.';
  if (sync.status === 'offline') return 'Sem internet. As alterações estão salvas neste navegador.';
  if (sync.status === 'error') return 'A sincronização precisa de atenção';
  if (sync.conflict) return 'Sincronização pausada. Escolha qual cópia usar.';
  if (sync.status === 'synced') return sync.lastSyncedAt
    ? `Sincronizado às ${new Date(sync.lastSyncedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : 'Suas notas estão sincronizadas';
  if (sync.status === 'unavailable') return 'A conexão com o Google Drive ainda não está configurada neste ambiente.';
  if (sync.wasConnected) return 'Vincule sua conta novamente para continuar sincronizando.';
  return 'Vincule sua conta para sincronizar suas notas.';
}

export function CloudStorageSettings({ sync, details = false, active = true, onNavigate }: { sync: GoogleDriveSync; details?: boolean; active?: boolean; onNavigate: (details: boolean) => void }) {
  const headingId = useId();
  const busy = sync.status === 'connecting' || sync.status === 'syncing';
  const connectLabel = sync.status === 'connecting' ? 'Vinculando…' : sync.wasConnected ? 'Vincular novamente' : 'Vincular';
  const [copies, setCopies] = useState<RecoveryCopy[]>([]);
  const [recoveryError, setRecoveryError] = useState('');
  useEffect(() => {
    if (!details || !active) return;
    let live = true;
    void recoveryCopies().then(value => { if (live) { setCopies(value); setRecoveryError(''); } })
      .catch(() => { if (live) setRecoveryError('Não foi possível carregar as cópias de segurança. Feche e abra as preferências para tentar novamente.'); });
    return () => { live = false; };
  }, [details, active, sync.status]);
  function downloadRecovery() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ copies }, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'open-notes-copias-de-seguranca.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className={`cloud-settings${details ? ' cloud-details' : ''}`} aria-labelledby={headingId}>
      {details ? <>
        <div className="cloud-detail-heading">
          <img src={googleDriveIcon} alt="" width="28" height="28" />
          <h3 id={headingId}>Integração com o Google Drive</h3>
        </div>
        <p>Conecte sua conta do Google para manter uma cópia privada do seu espaço de notas no Drive.</p>
        <ul className="cloud-benefits">
          <li><strong>Seu espaço completo</strong> — notas, coleções, pastas, etiquetas e seu perfil (nome e foto) em uma única cópia.</li>
          <li><strong>Sincronização automática</strong> — suas alterações são enviadas após a edição.</li>
          <li><strong>Entre dispositivos</strong> — vincule a mesma conta para carregar a cópia mais recente.</li>
          <li><strong>Acesso offline</strong> — continue escrevendo com salvamento neste navegador.</li>
        </ul>
        {sync.conflict && <div className="cloud-conflict" role="region" aria-labelledby="drive-conflict-title">
          <h4 id="drive-conflict-title">Há dados diferentes neste navegador e no Drive</h4>
          <p>Navegador: {sync.conflict.localNotes} notas. Drive: {sync.conflict.remoteNotes} notas. Nada será enviado até você escolher. Uma cópia das duas versões será preservada neste navegador antes da substituição.</p>
          <div className="cloud-conflict-actions">
            <button className="secondary-button" disabled={busy} onClick={() => void sync.resolveConflict('remote')}>Usar cópia do Drive</button>
            <button className="secondary-button" disabled={busy} onClick={() => void sync.resolveConflict('local')}>Usar cópia deste navegador</button>
          </div>
          <p>A escolha inclui as notas e o perfil (nome e foto). Usar o Drive substitui a cópia local. Usar este navegador substitui a cópia do Drive.</p>
        </div>}
        <div className="cloud-detail-cards">
          <div className="cloud-detail-card">
            {sync.connected ? <ConnectedStatusIcon /> : <span className="cloud-state-icon" aria-hidden="true" />}
            <div className="cloud-card-copy"><h4>{sync.connected ? 'Conta do Google vinculada' : 'Conta do Google'}</h4><p>{sync.connected ? 'Sua conta está vinculada nesta sessão.' : 'Autorize o Open Notes para ativar a sincronização.'}</p></div>
            <button className="secondary-button" disabled={busy || sync.status === 'unavailable'} onClick={() => sync.connected ? sync.disconnect() : void sync.connect()}><TextSwap text={sync.connected ? 'Desvincular' : connectLabel} /></button>
          </div>
          <div className="cloud-detail-card">
            <span className="cloud-card-icon" aria-hidden="true"><FolderCloud size={19} /></span>
            <div className="cloud-card-copy"><h4>Sincronização do seu espaço</h4><p role="status" aria-live="polite" aria-atomic="true"><TextSwap text={statusCopy(sync)} /></p><span className="cloud-badge">Automática após vincular</span></div>
            {sync.connected && <button className="secondary-button cloud-sync-button" disabled={busy || !!sync.conflict} onClick={() => void sync.syncNow()}>
              {sync.status === 'syncing' && <Refresh size={15} className="cloud-sync-spinner" aria-hidden="true" />}
              <TextSwap text={sync.status === 'syncing' ? 'Sincronizando…' : 'Sincronizar agora'} />
            </button>}
          </div>
          <div className="cloud-detail-card">
            <span className="cloud-card-icon" aria-hidden="true"><ShieldTick size={19} /></span>
            <div className="cloud-card-copy"><h4>Uma cópia privada no Drive</h4><p>O Open Notes só tem acesso aos dados criados pelo próprio aplicativo. Seus outros arquivos do Google Drive permanecem privados e não podem ser acessados.</p></div>
          </div>
        </div>
        {sync.error && sync.status !== 'offline' && <p className="cloud-error" role="alert">{sync.error}</p>}
        <p className="cloud-footnote">Desvincular encerra a conexão. Suas notas neste navegador e a cópia já salva no Drive são mantidas.</p>
        {copies.length > 0 && <button className="text-button" onClick={downloadRecovery}>Baixar cópias de segurança</button>}
        {recoveryError && <p className="cloud-error" role="alert">{recoveryError}</p>}
      </> : <>
        <div className="cloud-list-heading"><h3 id={headingId}>Integrações</h3><span>1 disponível</span></div>
        <button className="cloud-connectors" onClick={() => onNavigate(true)}>
          <span className="cloud-provider-link"><span className="cloud-provider-icon"><img src={googleDriveIcon} alt="" /></span>Google Drive</span>
          <span className="cloud-connection-label">
            {sync.conflict && <AlertTriangle className="cloud-warning-icon" size={19} aria-hidden="true" />}
            {sync.connected && !sync.conflict && <ConnectedStatusIcon />}
            <TextSwap text={sync.conflict ? 'Revisar cópias' : sync.connected ? 'Vinculado' : connectLabel} />
          </span>
        </button>
      </>}
    </section>
  );
}
