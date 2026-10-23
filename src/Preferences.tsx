import { useLayoutEffect, useRef, useState } from 'react';
import { CloudStorageSettings } from './CloudStorageSettings';
import { DropboxIntegration, DropboxIntegrationRow } from './DropboxIntegration';
import type { useDropboxAuth } from './cloud/use-dropbox-auth';
import type { DropboxSync } from './cloud/use-dropbox-sync';
import type { GoogleDriveSync } from './cloud/use-google-drive-sync';
import { IconButton } from './IconButton';
import { TextSwap } from './Feedback';
import { ArrowLeft, Moon, PlugCircle, Settings2, ShieldTick, Sun, X } from './icons';
import type { Palette } from './themes';
import { AccentColorPicker } from './AccentColorPicker';
import type { UserProfile } from './data';
import { ProfileSettings } from './UserProfile';
import type { Notify } from './app/use-toasts';

type Props = {
  theme: string;
  onToggleTheme: () => void;
  palette: Palette;
  onPaletteChange: (palette: Palette) => void;
  customAccent: string;
  onCustomAccentChange: (color: string) => void;
  onDismiss: () => void;
  sync: GoogleDriveSync;
  profile: UserProfile;
  onProfileUpdate: (patch: Partial<UserProfile>) => void;
  notify: Notify;
  dropbox: ReturnType<typeof useDropboxAuth>;
  dropboxSync: DropboxSync;
};

export function Preferences({ theme, onToggleTheme, palette, onPaletteChange, customAccent, onCustomAccentChange, onDismiss, sync, profile, onProfileUpdate, notify, dropbox, dropboxSync }: Props) {
  const [section, setSection] = useState<'general' | 'integrations'>('general');
  const [sectionVisit, setSectionVisit] = useState(0);
  const [provider, setProvider] = useState<'google-drive' | 'dropbox'>('google-drive');
  const [scrolled, setScrolled] = useState(false);
  const [hasBelow, setHasBelow] = useState(false);
  const [details, setDetails] = useState(false);
  const pages = useRef<HTMLDivElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousView = useRef({ details: false, section });
  function navigateSection(next: typeof section) {
    setSection(next);
    setDetails(false);
    setSectionVisit(visit => visit + 1);
  }
  function openProvider(next: typeof provider) {
    setProvider(next);
    setDetails(true);
  }
  function updateScroll(page: HTMLElement) {
    setScrolled(page.scrollTop > 1);
    setHasBelow(page.scrollHeight - page.clientHeight - page.scrollTop > 1);
  }
  useLayoutEffect(() => {
    const page = pages.current?.querySelector<HTMLElement>(`[data-page-id="${details ? 2 : 1}"]`);
    if (page) page.scrollTop = 0;
    if (details) backButton.current?.focus({ preventScroll: true });
    else if (previousView.current.details && previousView.current.section === section && section === 'integrations') {
      page?.querySelector<HTMLButtonElement>(`[data-provider="${provider}"]`)?.focus({ preventScroll: true });
    } else heading.current?.focus({ preventScroll: true });
    setScrolled(false);
    previousView.current = { details, section };
  }, [details, section, sectionVisit, provider]);
  useLayoutEffect(() => {
    const page = pages.current?.querySelector<HTMLElement>(`[data-page-id="${details ? 2 : 1}"]`);
    if (!page) return;
    const refresh = () => updateScroll(page);
    refresh();
    const observer = new ResizeObserver(refresh);
    observer.observe(page);
    Array.from(page.children).forEach(child => observer.observe(child));
    return () => observer.disconnect();
  }, [details, section, sectionVisit, provider]);

  return <div className="preferences-layout">
    <aside className="preferences-sidebar">
      <h2 id="dialog-title">Preferências</h2>
      <nav aria-label="Seções das preferências">
        <button className="preferences-nav-item" aria-current={section === 'general' ? 'page' : undefined} onClick={() => navigateSection('general')}><Settings2 size={20} />Geral</button>
        <button className="preferences-nav-item" aria-current={section === 'integrations' ? 'page' : undefined} onClick={() => navigateSection('integrations')}><PlugCircle size={20} />Integrações</button>
      </nav>
    </aside>
    <div className="preferences-panel" data-has-scroll-above={scrolled} data-has-scroll={hasBelow}>
      <header className="preferences-content-header">
        {details
          ? <button ref={backButton} className="cloud-back" onClick={() => setDetails(false)}><ArrowLeft size={20} />Integrações</button>
          : <h3 className="preferences-section-title" ref={heading} tabIndex={-1}>{section === 'general' ? 'Geral' : 'Integrações'}</h3>}
        <IconButton className="icon-button preferences-close" aria-label="Fechar" onClick={onDismiss}><X size={20} /></IconButton>
      </header>
      <div ref={pages} className="settings-content t-page-slide" id="preferences-settings" data-section={section} data-page={details ? '2' : '1'}>
      <div className="t-page" data-page-id="1" inert={details} aria-hidden={details} onScroll={event => { if (!details) updateScroll(event.currentTarget); }}>
        <div hidden={section !== 'general'}>
        <ProfileSettings profile={profile} onUpdate={onProfileUpdate} />
        <div className="setting-row"><span>Aparência</span><button className="secondary-button preferences-theme-toggle" onClick={onToggleTheme}><span className="t-icon-swap" data-state={theme === 'light' ? 'a' : 'b'} aria-hidden="true"><Sun className="t-icon" data-icon="a" size={20} /><Moon className="t-icon" data-icon="b" size={20} /></span><TextSwap text={theme === 'light' ? 'Claro' : 'Escuro'} /></button></div>
        <AccentColorPicker theme={theme} palette={palette} onPaletteChange={onPaletteChange} customAccent={customAccent} onCustomAccentChange={onCustomAccentChange} />
        <div className="privacy-note"><ShieldTick size={20} aria-hidden="true" /><div><strong>Privacidade em primeiro lugar</strong><p>O Open Notes salva suas informações localmente neste navegador. Ao conectar o Google Drive, uma cópia privada dos seus dados também é sincronizada na nuvem.</p></div></div>
        </div>
        <div hidden={section !== 'integrations'}>
          <CloudStorageSettings sync={sync} showHeading={false} onNavigate={() => openProvider('google-drive')}>
            <DropboxIntegrationRow auth={dropbox} sync={dropboxSync} onNavigate={() => openProvider('dropbox')} />
          </CloudStorageSettings>
        </div>
      </div>
      <div className="t-page" data-page-id="2" inert={!details} aria-hidden={!details} onScroll={event => { if (details) updateScroll(event.currentTarget); }}>
        {provider === 'dropbox'
          ? <DropboxIntegration auth={dropbox} sync={dropboxSync} notify={notify} active={details && section === 'integrations'} />
          : <CloudStorageSettings sync={sync} details active={details && section === 'integrations'} onNavigate={setDetails} />}
      </div>
      </div>
    </div>
  </div>;
}
