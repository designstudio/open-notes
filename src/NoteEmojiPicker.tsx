import { Component, useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { defaultEmojiDataResolver, EmojiPicker, type EmojiDataResolver, type SkinTone } from 'frimousse';
import { Search, SmileCircle, Leaf, Coffee, Compass, Star, Sun, Hash, ForbiddenCircle } from './icons';
import { ClockCircleIcon } from '@solar-icons/react/linear/clock-circle';
import { UsersGroupRoundedIcon } from '@solar-icons/react/linear/users-group-rounded';
import { FlagIcon } from '@solar-icons/react/linear/flag';
import { NoteEmoji } from './NoteEmoji';
import { EmojiSkinTonePicker } from './EmojiSkinTonePicker';
import './note-emoji-picker.css';

const RECENTS_KEY = 'open-notes:recent-emojis';
const TONE_KEY = 'open-notes:emoji-skin-tone';
const tones: SkinTone[] = ['none', 'light', 'medium-light', 'medium', 'medium-dark', 'dark'];
const categoryIcons = [SmileCircle, UsersGroupRoundedIcon, Leaf, Coffee, Compass, Star, Sun, Hash, FlagIcon];

function readRecents(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 24) : [];
  } catch { return []; }
}
function readTone(): SkinTone {
  try { return tones.find(tone => tone === localStorage.getItem(TONE_KEY)) ?? 'none'; }
  catch { return 'none'; }
}
function save(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Selection works without preference storage. */ }
}

class PickerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="emoji-picker-error" role="alert">
      <p>Não foi possível carregar os emojis.</p>
      <button type="button" onClick={() => this.setState({ failed: false })}>Tentar novamente</button>
    </div> : this.props.children;
  }
}

function PickerContent({ value, onChoose, onRemove }: { value?: string; onChoose: (emoji: string) => void; onRemove: () => void }) {
  const [recents] = useState(readRecents);
  const [skinTone, setSkinTone] = useState(readTone);
  const [categories, setCategories] = useState<{ index: number; label: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollEdges, setScrollEdges] = useState({ above: false, below: false });
  const refreshScrollEdges = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const above = el.scrollTop > 1;
    const below = el.scrollHeight - el.clientHeight - el.scrollTop > 1;
    setScrollEdges(previous => previous.above === above && previous.below === below ? previous : { above, below });
  }, []);
  useLayoutEffect(() => {
    refreshScrollEdges();
    const observer = new ResizeObserver(refreshScrollEdges);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [refreshScrollEdges]);
  const headers = useRef(new Map<string, HTMLDivElement>());
  const resolveData: EmojiDataResolver = useCallback(async (locale, options) => {
    const data = await defaultEmojiDataResolver(locale, { ...options, emojibaseUrl: `${location.origin}/emoji` });
    const recentEmojis = recents.flatMap(emoji => {
      const base = data.emojis.find(item => item.emoji === emoji || Object.values(item.skins ?? {}).includes(emoji));
      return base ? [{ ...base, emoji, category: -1, skins: undefined }] : [];
    });
    const localized = data.categories.map(category => ({ ...category, label: category.index === 9 ? 'Bandeiras' : category.label }));
    const groups = recentEmojis.length ? [{ index: -1, label: 'Recentes' }, ...localized] : localized;
    setCategories(groups);
    setActiveCategory(groups[0]?.label ?? '');
    return { ...data, categories: groups, emojis: [...recentEmojis, ...data.emojis] };
  }, [recents]);
  // Stable identities preserve the virtualized list's measurements and focus.
  const components = useMemo(() => ({
    CategoryHeader: ({ category, ...props }: import('frimousse').EmojiPickerListCategoryHeaderProps) => <div {...props} className="emoji-picker-heading" ref={el => {
      if (el) headers.current.set(category.label, el);
      else headers.current.delete(category.label);
    }}>{category.label}</div>,
    Row: ({ children, ...props }: import('frimousse').EmojiPickerListRowProps) => <div {...props} className="emoji-picker-row">{children}</div>,
    Emoji: ({ emoji, ...props }: import('frimousse').EmojiPickerListEmojiProps) => <button {...props} type="button" className="emoji-picker-option" aria-pressed={emoji.emoji === value}><NoteEmoji value={emoji.emoji} size={28} opticalOffset={false} /></button>,
  }), [value]);
  function updateCategory() {
    const viewport = viewportRef.current;
    if (!viewport || search) return;
    let current = categories[0]?.label ?? '';
    for (const category of categories) {
      const top = headers.current.get(category.label)?.parentElement?.offsetTop;
      if (top !== undefined && top <= viewport.scrollTop + 1) current = category.label;
    }
    setActiveCategory(current);
  }
  function jumpToCategory(label: string) {
    const top = headers.current.get(label)?.parentElement?.offsetTop;
    if (top === undefined || !viewportRef.current) return;
    viewportRef.current.scrollTop = top;
    setActiveCategory(label);
  }
  return <EmojiPicker.Root className="emoji-picker" locale="pt" columns={8} sticky={false} resolveEmojiData={resolveData} skinTone={skinTone} onEmojiSelect={({ emoji }) => {
    save(RECENTS_KEY, JSON.stringify([emoji, ...recents.filter(item => item !== emoji)].slice(0, 24)));
    onChoose(emoji);
  }}>
    <div className="emoji-picker-search">
      <Search size={16} aria-hidden="true" />
      <EmojiPicker.Search autoFocus placeholder="Buscar emoji…" aria-label="Buscar emoji" value={search} onChange={event => setSearch(event.target.value)} />
    </div>
    <nav className="emoji-picker-categories" aria-label="Categorias de emojis" hidden={Boolean(search)}>
      {categories.map(category => {
        const Icon = category.index === -1 ? ClockCircleIcon : categoryIcons[category.index > 2 ? category.index - 1 : category.index] ?? SmileCircle;
        return <button type="button" key={category.index} aria-label={category.label} title={category.label} aria-pressed={activeCategory === category.label} onClick={() => jumpToCategory(category.label)}><Icon size={17} aria-hidden="true" /></button>;
      })}
    </nav>
    <div className="emoji-picker-scroll-frame" data-has-scroll={scrollEdges.below} data-has-scroll-above={scrollEdges.above}>
    <EmojiPicker.Viewport ref={viewportRef} className="emoji-picker-viewport" aria-label="Emojis disponíveis" onScroll={() => { refreshScrollEdges(); updateCategory(); }}>
      <EmojiPicker.Loading className="emoji-picker-message" role="status">Carregando emojis…</EmojiPicker.Loading>
      <EmojiPicker.Empty className="emoji-picker-message" role="status">Nenhum emoji encontrado.</EmojiPicker.Empty>
      <div ref={contentRef}><EmojiPicker.List components={components} /></div>
    </EmojiPicker.Viewport>
    </div>
    <div className="emoji-picker-footer">
      <EmojiPicker.ActiveEmoji>{({ emoji }) => <div className="emoji-picker-preview">
        <span className="emoji-picker-preview-glyph"><NoteEmoji value={emoji?.emoji ?? value ?? '😊'} size={32} opticalOffset={false} /></span>
        <span>{emoji?.label ?? 'Escolha um emoji'}</span>
      </div>}</EmojiPicker.ActiveEmoji>
      <EmojiSkinTonePicker value={skinTone} onChange={tone => { setSkinTone(tone); save(TONE_KEY, tone); }} />
      <button type="button" className="emoji-picker-remove" aria-label="Remover ícone" title="Remover ícone" onClick={onRemove}><ForbiddenCircle size={17} aria-hidden="true" /></button>
    </div>
  </EmojiPicker.Root>;
}

export default function NoteEmojiPicker(props: { value?: string; onChoose: (emoji: string) => void; onRemove: () => void }) {
  return <PickerBoundary><PickerContent {...props} /></PickerBoundary>;
}
