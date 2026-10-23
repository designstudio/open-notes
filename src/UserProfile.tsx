import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { UserProfile } from './data';
import { Camera, Check, PenLine, X } from './icons';
import { prepareProfilePhoto, profileInitials } from './profile';
import './user-profile.css';

export function UserAvatar({ profile }: { profile: UserProfile }) {
  return <span className="avatar user-avatar" aria-hidden="true">
    {profile.photo ? <img src={profile.photo} alt="" /> : profileInitials(profile.name)}
  </span>;
}

export function ProfileSettings({ profile, onUpdate }: { profile: UserProfile; onUpdate: (patch: Partial<UserProfile>) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const nameButton = useRef<HTMLButtonElement>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (editing) { nameInput.current?.focus(); nameInput.current?.select(); } }, [editing]);

  function saveName() {
    onUpdate({ name: draft.trim() });
    setEditing(false);
    requestAnimationFrame(() => nameButton.current?.focus());
  }
  function cancelName() {
    setDraft(profile.name);
    setEditing(false);
    requestAnimationFrame(() => nameButton.current?.focus());
  }
  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true); setError('');
    try {
      const photo = await prepareProfilePhoto(file);
      if (mounted.current) onUpdate({ photo });
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : 'Não foi possível abrir essa foto. Escolha outra imagem.');
    } finally { if (mounted.current) setBusy(false); }
  }

  return <section className="profile-settings" aria-label="Seu perfil">
    <button type="button" className="profile-photo" aria-label={profile.photo ? 'Alterar foto de perfil' : 'Adicionar foto de perfil'} disabled={busy} aria-busy={busy} onClick={() => fileInput.current?.click()}>
      <UserAvatar profile={profile} />
      <span className={`profile-photo-overlay${busy ? ' is-busy' : ''}`} aria-hidden="true"><Camera size={20} /></span>
    </button>
    <input ref={fileInput} className="profile-file-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Selecionar foto de perfil" tabIndex={-1} onChange={event => void choosePhoto(event)} />
    {editing ? <form className="profile-name-editor" onSubmit={event => { event.preventDefault(); saveName(); }} onKeyDown={event => {
      if (event.nativeEvent.isComposing) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancelName(); }
    }}>
      <input ref={nameInput} className="profile-name-input" aria-label="Seu nome" maxLength={80} value={draft} placeholder="Seu nome" onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.nativeEvent.isComposing && event.key === 'Enter') event.preventDefault(); }} />
      <button type="submit" className="profile-name-confirm" aria-label="Salvar nome"><Check size={20} aria-hidden="true" /></button>
      <button type="button" className="profile-name-cancel" aria-label="Cancelar edição do nome" onClick={cancelName}><X size={20} aria-hidden="true" /></button>
    </form> : <button ref={nameButton} type="button" className="profile-name" aria-label="Editar nome" onClick={() => { setDraft(profile.name); setEditing(true); }}>
      <span>{profile.name || 'Seu nome'}</span><PenLine size={20} aria-hidden="true" />
    </button>}
    {error && <p className="profile-error" role="alert">{error}</p>}
    {busy && <span className="profile-progress" role="status">Preparando foto…</span>}
  </section>;
}
