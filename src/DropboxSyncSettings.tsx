import { useCallback, useEffect, useId, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { DropboxSync } from './cloud/use-dropbox-sync';
import { recoveryCopies, type RecoveryCopy } from './cloud/recovery-storage';
import { ArrowUpRight, Check, ChevronDown, CloudCheck, CloudCross, Download, FolderCloud, Refresh } from './icons';
import { TextSwap } from './Feedback';
import { isSyncIntervalHours, syncIntervalOptions } from './cloud/dropbox-sync-schedule';

const intervalLabel = (hours: number) => `${hours} ${hours === 1 ? 'hora' : 'horas'}`;

const inactiveSync: DropboxSync = { status: 'paused', enabled: false, lastSyncedAt: null, error: null, conflict: null,
  intervalHours: 1, nextSyncAt: null, setIntervalHours() {},
  async syncNow() {}, async activate() {}, async resolveConflict() {} };

export function DropboxSyncSettings({ sync: providedSync, authorized, active = true, notice, noticeIsError = false, needsPermissions = false, onVerifyPermissions }: {
  sync?: DropboxSync; authorized: boolean; active?: boolean; notice?: string; noticeIsError?: boolean; needsPermissions?: boolean; onVerifyPermissions?: () => Promise<void>;
}) {
  const sync = providedSync ?? inactiveSync;
  const hasSync = Boolean(providedSync);
  const conflictId = useId(), scheduleId = useId(), scheduleValueId = useId(), scheduleHintId = useId();
  const [menuContainer, setMenuContainer] = useState<HTMLDialogElement | null>(null);
  // Keep the portal inside the native dialog's top layer and outside its scrolling content.
  const scheduleTrigger = useCallback((node: HTMLButtonElement | null) => {
    setMenuContainer(node?.closest?.('dialog') ?? null);
  }, []);
  const [verifying, setVerifying] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  useEffect(() => { if (!needsPermissions) setPermissionsChecked(false); }, [needsPermissions]);
  const [copies, setCopies] = useState<RecoveryCopy[]>([]), [backupError, setBackupError] = useState('');
  useEffect(() => {
    if (!active || !hasSync) return;
    let live = true;
    void recoveryCopies().then(value => { if (live) { setCopies(value); setBackupError(''); } })
      .catch(() => { if (live) setBackupError('Não foi possível carregar as cópias de segurança.'); });
    return () => { live = false; };
  }, [active, sync.status, hasSync]);
  const busy = sync.status === 'syncing';
  const hasSuccessfulSync = sync.status === 'synced' || (sync.status === 'scheduled' && sync.lastSyncedAt !== null);
  const StatusIcon = noticeIsError || needsPermissions || sync.status === 'error' || Boolean(sync.error)
    ? CloudCross : sync.enabled && authorized && !notice && hasSuccessfulSync ? CloudCheck : FolderCloud;
  const last = sync.lastSyncedAt ? `Última sincronização: ${new Date(sync.lastSyncedAt).toLocaleString('pt-BR')}.` : 'Nenhuma sincronização concluída.';
  const status = needsPermissions && permissionsChecked && !verifying
    ? 'O Dropbox não confirmou as permissões deste vínculo. Desvincule e conecte novamente para autorizar a sincronização.'
    : notice || (!sync.enabled ? 'Sincronização pausada. Ativar o Dropbox pausa o Google Drive.'
    : !authorized ? 'Autorize leitura e escrita para sincronizar.'
    : busy ? 'Sincronizando…' : sync.status === 'conflict' ? 'Escolha qual cópia usar para continuar.'
    : sync.status === 'offline' ? 'Sem internet. Suas alterações continuam salvas neste navegador.'
    : sync.status === 'error' ? 'A sincronização precisa de atenção.' : sync.status === 'synced' ? 'Seu espaço está sincronizado com o Dropbox.'
    : sync.status === 'scheduled' ? 'Sincronização agendada. Suas alterações continuam salvas neste navegador.' : 'Aguardando a primeira sincronização.');
  return <>
    {sync.conflict && <div className="cloud-conflict" role="region" aria-labelledby={conflictId}>
      <h4 id={conflictId}>Há dados diferentes neste navegador e no Dropbox</h4>
      <p>Navegador: {sync.conflict.localNotes} notas. Dropbox: {sync.conflict.remoteNotes} notas. Uma cópia das duas versões será preservada antes da substituição.</p>
      <div className="cloud-conflict-actions">
        <button className="secondary-button" disabled={busy || !sync.enabled || !authorized} onClick={() => void sync.resolveConflict('remote')}>Usar cópia do Dropbox</button>
        <button className="secondary-button" disabled={busy || !sync.enabled || !authorized} onClick={() => void sync.resolveConflict('local')}>Usar cópia deste navegador</button>
      </div>
      <p>A escolha inclui notas, coleções, pastas e perfil. Nenhuma versão será substituída sem sua escolha.</p>
    </div>}
    <div className="cloud-detail-card">
      <span className="cloud-card-icon" aria-hidden="true"><StatusIcon size={20} /></span>
      <div className="cloud-card-copy">
        <div className="dropbox-sync-summary">
          <div><h4>Sincronização do seu espaço</h4>
            {noticeIsError ? <p className="cloud-error" role="alert">{status}</p> : <p role="status" aria-live="polite"><TextSwap text={status} /></p>}
            {needsPermissions && <p>Na <a className="cloud-badge dropbox-console-link" href="https://www.dropbox.com/developers/apps?utm_source=opennotes" target="_blank" rel="noopener noreferrer">App Console<ArrowUpRight size={20} aria-hidden="true" /></a>, confira{' '}
              <code className="cloud-badge">files.content.read</code> e <code className="cloud-badge">files.content.write</code>.{' '}
              Se já estão habilitadas, use Verificar permissões. Se a verificação não confirmar o acesso, desvincule e conecte novamente para atualizar a autorização deste vínculo.</p>}
            {sync.error && !notice && <p className="cloud-error" role="alert">{sync.error}</p>}
            <p>{last}</p>
            {sync.nextSyncAt && sync.enabled && authorized && !notice && !sync.conflict && <p>{sync.status === 'error' || sync.status === 'offline' ? 'Próxima tentativa prevista' : 'Próxima sincronização prevista'}: {new Date(sync.nextSyncAt).toLocaleString('pt-BR')}.</p>}
          </div>
          {needsPermissions && onVerifyPermissions ? <button className="secondary-button cloud-sync-button" disabled={verifying} onClick={() => {
            setVerifying(true);
            void onVerifyPermissions().finally(() => { setPermissionsChecked(true); setVerifying(false); });
          }}><TextSwap text={verifying ? 'Verificando…' : 'Verificar permissões'} /></button> : <button className="secondary-button cloud-sync-button" disabled={!providedSync || !authorized || busy || !!sync.conflict} onClick={() => void (sync.enabled ? sync.syncNow() : sync.activate())}>
            {busy && <Refresh size={20} className="cloud-sync-spinner" aria-hidden="true" />}
            <TextSwap text={busy ? 'Sincronizando…' : sync.enabled ? 'Sincronizar agora' : 'Ativar sincronização'} />
          </button>}
        </div>
        <div className="dropbox-sync-schedule">
          <div>
            <span id={scheduleId} className="dropbox-sync-schedule-label">Sincronização automática</span>
            <p id={scheduleHintId}>Com o Open Notes aberto. Se o horário passar enquanto estiver fechado, sincroniza ao reabrir. O salvamento local é imediato.</p>
          </div>
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
              <button ref={scheduleTrigger} type="button" className="secondary-button dropbox-sync-interval"
                disabled={!providedSync || busy} aria-labelledby={`${scheduleId} ${scheduleValueId}`} aria-describedby={scheduleHintId}>
                <span id={scheduleValueId}>{intervalLabel(sync.intervalHours)}</span><ChevronDown size={20} aria-hidden="true" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal container={menuContainer}>
              <DropdownMenu.Content className="note-actions-menu dropbox-sync-interval-menu t-dropdown" align="end" sideOffset={10} collisionPadding={12}
                aria-labelledby={scheduleId} onEscapeKeyDown={event => event.stopPropagation()}>
                <DropdownMenu.RadioGroup value={String(sync.intervalHours)} onValueChange={value => {
                  const hours = Number(value);
                  if (isSyncIntervalHours(hours)) sync.setIntervalHours(hours);
                }}>
                  {syncIntervalOptions.map(hours => <DropdownMenu.RadioItem key={hours} value={String(hours)} className="note-action">
                    <span>{intervalLabel(hours)}</span><DropdownMenu.ItemIndicator><Check size={20} aria-hidden="true" /></DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>)}
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
    {copies.length > 0 && <div className="cloud-detail-card">
      <span className="cloud-card-icon" aria-hidden="true"><Download size={20} /></span>
      <div className="cloud-card-copy"><h4>Cópias de segurança</h4><p>Exporte as cópias de segurança salvas neste navegador em um arquivo JSON.</p></div>
      <button type="button" className="secondary-button" onClick={() => {
        const url = URL.createObjectURL(new Blob([JSON.stringify({ copies }, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a'); link.href = url; link.download = 'open-notes-copias-de-seguranca.json'; link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}>Exportar</button>
    </div>}
    {backupError && <p className="cloud-error" role="alert">{backupError}</p>}
  </>;
}
