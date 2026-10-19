import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CloudStorageSettings } from './CloudStorageSettings';
import type { GoogleDriveSync } from './cloud/use-google-drive-sync';
import { IconButton } from './IconButton';
import { TextSwap } from './Feedback';
import { ArrowLeft, Moon, Settings2, ShieldTick, Sun, X } from './icons';
import type { Palette } from './themes';
import { AccentColorPicker } from './AccentColorPicker';
import type { UserProfile } from './data';
import { ProfileSettings } from './UserProfile';

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
};

export function Preferences({ theme, onToggleTheme, palette, onPaletteChange, customAccent, onCustomAccentChange, onDismiss, sync, profile, onProfileUpdate }: Props) {
  const [generalVisit, setGeneralVisit] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [hasBelow, setHasBelow] = useState(false);
  const [details, setDetails] = useState(false);
  const pages = useRef<HTMLDivElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousDetails = useRef(details);
  useLayoutEffect(() => {
    // Loading can replace the focused fallback button inside an open dialog.
    heading.current?.focus({ preventScroll: true });
  }, []);
  function updateScroll(page: HTMLElement) {
    setScrolled(page.scrollTop > 1);
    setHasBelow(page.scrollHeight - page.clientHeight - page.scrollTop > 1);
  }
  useLayoutEffect(() => {
    if (previousDetails.current !== details) {
      const page = pages.current?.querySelector<HTMLElement>(`[data-page-id="${details ? 2 : 1}"]`);
      if (page) page.scrollTop = 0;
      if (details) backButton.current?.focus({ preventScroll: true });
      else page?.querySelector<HTMLButtonElement>('.cloud-connectors')?.focus({ preventScroll: true });
      setScrolled(false);
    }
    previousDetails.current = details;
  }, [details]);
  useLayoutEffect(() => {
    const page = pages.current?.querySelector<HTMLElement>(`[data-page-id="${details ? 2 : 1}"]`);
    if (!page) return;
    const refresh = () => updateScroll(page);
    refresh();
    const observer = new ResizeObserver(refresh);
    observer.observe(page);
    Array.from(page.children).forEach(child => observer.observe(child));
    return () => observer.disconnect();
  }, [details, generalVisit]);
  useEffect(() => {
    if (generalVisit > 0) heading.current?.focus();
  }, [generalVisit]);

  return <div className="preferences-layout">
    <aside className="preferences-sidebar">
      <h2 id="dialog-title">Preferências</h2>
      <nav aria-label="Seções das preferências">
        <button className="preferences-nav-item" aria-current="page" onClick={() => {
          setGeneralVisit(visit => visit + 1);
          setDetails(false);
        }}><Settings2 size={17} />Geral</button>
      </nav>
    </aside>
    <div className="preferences-panel" data-has-scroll-above={scrolled} data-has-scroll={hasBelow}>
      <header className="preferences-content-header">
        {details
          ? <button ref={backButton} className="cloud-back" onClick={() => setDetails(false)}><ArrowLeft size={15} />Suas preferências</button>
          : <h3 className="preferences-section-title" ref={heading} tabIndex={-1}>Geral</h3>}
        <IconButton className="icon-button preferences-close" aria-label="Fechar" onClick={onDismiss}><X size={19} /></IconButton>
      </header>
      <div ref={pages} className="settings-content t-page-slide" id="general-settings" data-page={details ? '2' : '1'}>
      <div className="t-page" data-page-id="1" inert={details} aria-hidden={details} onScroll={event => { if (!details) updateScroll(event.currentTarget); }}>
        <ProfileSettings profile={profile} onUpdate={onProfileUpdate} />
        <div className="setting-row"><span>Aparência</span><button className="secondary-button preferences-theme-toggle" onClick={onToggleTheme}><span className="t-icon-swap" data-state={theme === 'light' ? 'a' : 'b'} aria-hidden="true"><Sun className="t-icon" data-icon="a" size={16} /><Moon className="t-icon" data-icon="b" size={16} /></span><TextSwap text={theme === 'light' ? 'Claro' : 'Escuro'} /></button></div>
        <AccentColorPicker theme={theme} palette={palette} onPaletteChange={onPaletteChange} customAccent={customAccent} onCustomAccentChange={onCustomAccentChange} />
        <CloudStorageSettings key={generalVisit} sync={sync} onNavigate={setDetails} />
        <div className="privacy-note"><ShieldTick size={20} aria-hidden="true" /><div><strong>Privacidade em primeiro lugar</strong><p>O Open Notes salva suas informações localmente neste navegador. Ao conectar o Google Drive, uma cópia privada dos seus dados também é sincronizada na nuvem.</p></div></div>
      </div>
      <div className="t-page" data-page-id="2" inert={!details} aria-hidden={!details} onScroll={event => { if (details) updateScroll(event.currentTarget); }}>
        <CloudStorageSettings sync={sync} details active={details} onNavigate={setDetails} />
      </div>
      </div>
    </div>
  </div>;
}
