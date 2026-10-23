import { useEffect, useId, useState } from 'react';
import dropboxIcon from './assets/dropbox.svg';
import { dropboxConnectionLabel } from './cloud/dropbox-integration';
import type { useDropboxAuth } from './cloud/use-dropbox-auth';
import { TextSwap } from './Feedback';
import { AlertTriangle, ArrowUpRight, Check, Copy, Eye, EyeClosed, Key, ShieldTick } from './icons';
import './user-profile.css';
import type { Notify } from './app/use-toasts';
import type { DropboxSync } from './cloud/use-dropbox-sync';
import { DropboxSyncSettings } from './DropboxSyncSettings';

type DropboxAuth = ReturnType<typeof useDropboxAuth>;

export function DropboxIntegrationRow({ auth, sync, onNavigate }: { auth: DropboxAuth; sync?: DropboxSync; onNavigate: () => void }) {
  const needsAttention = auth.state.status === 'error' || auth.revocationPending || sync?.status === 'error' || !!sync?.error || !!sync?.conflict
    || (auth.state.status === 'connected' && !auth.syncReady);
  const label = sync?.conflict ? 'Revisar cópias' : needsAttention ? 'Revisar conexão' : sync?.status === 'syncing' ? 'Sincronizando…' : auth.state.status === 'connecting' ? 'Vinculando…'
    : auth.state.status === 'disconnecting' ? 'Desvinculando…' : auth.linked ? 'Vinculado' : 'Vincular';
  return <button className="cloud-connectors" data-provider="dropbox" onClick={onNavigate}>
    <span className="cloud-provider-link"><span className="cloud-provider-icon"><img src={dropboxIcon} alt="" /></span>Dropbox</span>
    <span className="cloud-connection-label">
      {needsAttention && <AlertTriangle className="cloud-warning-icon" size={20} aria-hidden="true" />}
      {!needsAttention && auth.state.status === 'connected' && <span className="cloud-state-icon is-connected" aria-hidden="true"><Check size={20} /></span>}
      <TextSwap text={label} />
    </span>
  </button>;
}

/** Details share the same authorization model as the list; navigation never authorizes. */
export function DropboxIntegration({ auth, sync, notify, active = true }: { auth: DropboxAuth; sync?: DropboxSync; notify: Notify; active?: boolean }) {
  const headingId = useId(), descriptionId = useId(), keyId = useId(), formId = useId();
  const [showKey, setShowKey] = useState(false);
  const [verifyingPermissions, setVerifyingPermissions] = useState(false);
  useEffect(() => { setShowKey(false); }, [active, auth.linked]);
  async function copyText(text: string, label: 'URL' | 'Chave') {
    try {
      await navigator.clipboard.writeText(text);
      notify(`${label} copiada`);
    } catch { notify(`Não foi possível copiar a ${label === 'URL' ? 'URL' : 'chave'}. Tente novamente.`, 'error'); }
  }
  const { state } = auth;
  const busy = auth.checking || verifyingPermissions || state.status === 'connecting' || state.status === 'disconnecting';
  const unavailable = state.status === 'unavailable';
  const needsPermissions = auth.linked && state.status === 'connected' && !auth.syncReady && !auth.revocationPending;
  const connectionNotice = auth.checking ? 'Verificando conexão…'
    : unavailable ? auth.serviceMessage || 'Inicie o Open Notes pelo servidor local. O cofre de credenciais do Windows é necessário para vincular sua conta.'
    : auth.revocationPending ? 'A revogação está pendente. A conexão não será restaurada enquanto ela não for concluída.'
    : state.status === 'error' ? state.message
    : needsPermissions ? 'As permissões de sincronização deste vínculo ainda não foram confirmadas.'
    : state.status !== 'connected' ? `${dropboxConnectionLabel(state)}.${state.status === 'disconnected' ? ' Conecte sua conta para sincronizar.' : ''}`
    : undefined;
  const action = state.status === 'disconnecting' ? 'Desconectando…' : auth.revocationPending ? 'Tentar revogar novamente'
    : state.status === 'connecting' ? 'Cancelar autorização' : 'Desvincular';
  return <section className="cloud-settings cloud-details dropbox-integration" aria-labelledby={headingId}>
    <div className="cloud-detail-heading">
      <img src={dropboxIcon} alt="" width="20" height="20" />
      <h3 id={headingId}>Integração com o Dropbox</h3>
    </div>
    <p id={descriptionId}>Vincule sua conta do Dropbox usando a App Key do seu próprio aplicativo.</p>
    <ul className="cloud-benefits">
      <li><strong>Conexão persistente</strong> — a autorização pode ser restaurada ao reabrir o Open Notes.</li>
      <li><strong>Credenciais protegidas</strong> — os tokens ficam no processo local e no cofre do Windows.</li>
      <li><strong>Seu próprio aplicativo</strong> — configure Scoped access e App folder no Dropbox.</li>
    </ul>
    <div className="cloud-detail-cards">
      {!auth.checking && !unavailable && <div className="cloud-detail-card">
        <span className="cloud-card-icon" aria-hidden="true"><Key size={20} /></span>
        <div className="cloud-card-copy">
          <form id={formId} className="dropbox-auth-form" onSubmit={event => {
            event.preventDefault();
            if (!busy && !auth.linked && /^[a-zA-Z0-9]{5,100}$/.test(auth.appKey.trim())) {
              setShowKey(false);
              void auth.connect();
            }
          }}>
            <div className="dropbox-key-copy">
              <h4>APP Key</h4>
              <a className="dropbox-create-key" href="https://www.dropbox.com/developers/apps?utm_source=opennotes" target="_blank" rel="noopener noreferrer">Criar uma App Key no Dropbox<ArrowUpRight size={20} aria-hidden="true" /></a>
            </div>
            <label className="sr-only" htmlFor={keyId}>Sua Dropbox App Key</label>
            <div className="dropbox-key-editor">
            <div className="dropbox-key-field">
              <input id={keyId} className="inline-edit-input" type={showKey ? 'text' : 'password'} value={auth.appKey} onChange={event => auth.setAppKey(event.target.value)}
                onKeyDown={event => { if (event.nativeEvent.isComposing && event.key === 'Enter') event.preventDefault(); }}
                autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={100}
                disabled={busy || auth.linked} required pattern="[a-zA-Z0-9]{5,100}" aria-describedby={descriptionId} />
              <div className="dropbox-key-actions">
                <button type="button" className="icon-button" aria-label={showKey ? 'Ocultar App Key' : 'Mostrar App Key'} aria-pressed={showKey} aria-controls={keyId} title={showKey ? 'Ocultar chave' : 'Mostrar chave'} onClick={() => setShowKey(value => !value)}>{showKey ? <EyeClosed size={17} /> : <Eye size={17} />}</button>
                <button type="button" className="icon-button" aria-label="Copiar App Key" title="Copiar chave" disabled={!auth.appKey.trim()} onClick={() => void copyText(auth.appKey.trim(), 'Chave')}><Copy size={17} /></button>
              </div>
            </div>
            </div>
            <div className="dropbox-connect-row">
              <p className="cloud-list-note">{auth.callbackUri && <>{auth.linked ? 'Endereço de redirecionamento usado neste vínculo:' : 'Cadastre este endereço de redirecionamento no seu aplicativo Dropbox:'}{' '}
                <button type="button" className="cloud-badge dropbox-callback-copy" aria-label="Copiar URL de redirecionamento" title="Copiar URL" onClick={() => void copyText(auth.callbackUri, 'URL')}><code>{auth.callbackUri}</code></button>{' '}
              </>}{!auth.linked && <>{auth.callbackUri ? 'e conecte-se' : 'Conecte-se'} para vincular sua conta.</>}</p>
              {auth.linked || state.status === 'connecting'
                ? <button type="button" className="secondary-button" disabled={verifyingPermissions || state.status === 'disconnecting'} onClick={() => void auth.disconnect()}><TextSwap text={action} /></button>
                : <button type="submit" className="secondary-button" aria-label="Conectar" disabled={busy || !/^[a-zA-Z0-9]{5,100}$/.test(auth.appKey.trim())}>Conectar</button>}
            </div>
          </form>
        </div>
      </div>}
      <DropboxSyncSettings sync={sync} authorized={auth.state.status === 'connected' && auth.syncReady && !auth.revocationPending}
        notice={connectionNotice} noticeIsError={state.status === 'error'} needsPermissions={needsPermissions} onVerifyPermissions={async () => {
          setVerifyingPermissions(true);
          try { await auth.verifyPermissions(); } finally { setVerifyingPermissions(false); }
        }} active={active} />
      <div className="cloud-detail-card">
        <span className="cloud-card-icon" aria-hidden="true"><ShieldTick size={20} /></span>
        <div className="cloud-card-copy"><h4>Uma cópia privada no Dropbox</h4><p>O Open Notes só tem acesso à pasta criada especialmente para o aplicativo no seu Dropbox. Seus outros arquivos permanecem privados e não podem ser acessados.</p></div>
      </div>
    </div>
    <p className="cloud-footnote">Desvincular revoga a autorização do Dropbox. Suas notas e cópias de segurança neste navegador são mantidas.</p>
  </section>;
}
