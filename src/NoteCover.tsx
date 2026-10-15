import { useRef, useState, type PointerEvent } from 'react';
import type { Note } from './data';
import { Gallery } from './icons';
import { NotePopover } from './NotePopover';
import { noteFieldPatch } from './note-field-state';

export const coverGradients = [
  { id: 'coast', name: 'Costa', color: 'radial-gradient(ellipse at 55% 120%, #e9ba55 0%, transparent 65%), linear-gradient(125deg, #668de8, #07505c)' },
  { id: 'aurora', name: 'Aurora', color: 'radial-gradient(ellipse at 90% 0%, #f37b80, transparent 70%), linear-gradient(150deg, #281947, #677ae5)' },
  { id: 'plum', name: 'Ameixa', color: 'linear-gradient(155deg, #efcbd8, #742888)' },
  { id: 'dusk', name: 'Entardecer', color: 'linear-gradient(160deg, #ffb0af, #494b92)' },
  { id: 'peach', name: 'Pêssego', color: 'linear-gradient(160deg, #ed9c67, #efd8ef)' },
  { id: 'citrus', name: 'Cítrico', color: 'linear-gradient(165deg, #ffd3de, #e9ff85)' },
  { id: 'sand', name: 'Areia', color: 'linear-gradient(150deg, #f7eeb4, #c588bc)' },
  { id: 'forest', name: 'Floresta', color: 'linear-gradient(150deg, #b8d4a8, #2d6054)' },
];
export function NoteCover({ note, onUpdate }: { note: Note; onUpdate: (patch: Partial<Note>) => void }) {
  const [tab, setTab] = useState<'gradients' | 'link'>('gradients');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [repositioning, setRepositioning] = useState(false);
  const [position, setPosition] = useState(note.coverPosition ?? 50);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ y: number; position: number } | null>(null);
  const positionRef = useRef(position);
  const gradient = coverGradients.find(item => item.id === note.coverGradient) ?? coverGradients[0];
  const image = note.cover && failedImage !== note.cover;
  function saveImage(value: string) { onUpdate({ cover: value, coverGradient: undefined, coverPosition: 50 }); setPosition(50); positionRef.current = 50; setFailedImage(null); }
  async function upload(file: File | undefined, close: () => void) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) { setError('Escolha uma imagem JPG, PNG, WebP ou GIF.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Escolha uma imagem de até 5 MB.'); return; }
    setLoading(true); setError('');
    try {
      const value = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file);
      });
      saveImage(value); close();
    } catch { setError('Não foi possível carregar essa imagem. Tente novamente.'); }
    finally { setLoading(false); }
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const next = Math.max(0, Math.min(100, drag.current.position - (event.clientY - drag.current.y) / event.currentTarget.clientHeight * 100));
    setPosition(next); positionRef.current = next;
  }
  return <div className="note-cover-block" data-repositioning={repositioning} style={{ background: gradient.color }}
    onPointerDown={event => {
      if (!repositioning || event.button !== 0 || (event.target as HTMLElement).closest('button, input')) return;
      drag.current = { y: event.clientY, position: positionRef.current }; event.currentTarget.setPointerCapture(event.pointerId);
    }} onPointerMove={move} onPointerUp={() => { if (drag.current) { drag.current = null; onUpdate({ coverPosition: positionRef.current }); } }} onPointerCancel={() => { drag.current = null; }}>
    {image && <img className="note-cover-image" src={note.cover} alt="Capa da nota" referrerPolicy="no-referrer" draggable={false} style={{ objectPosition: `center ${position}%` }} onError={() => setFailedImage(note.cover!)} />}
    {failedImage === note.cover && note.cover && <span className="note-cover-image-error" role="status">A imagem não pôde ser carregada. Escolha outra capa.</span>}
    {repositioning && <span className="note-cover-drag-hint">Arraste a imagem para reposicionar</span>}
    <div className="note-cover-controls">
      {repositioning ? <>
        <button type="button" onClick={() => { onUpdate({ coverPosition: positionRef.current }); setRepositioning(false); }}>Concluir</button>
      </> : <>
        <NotePopover label="Editar capa" className="note-cover-picker" trigger={(props, open) => <button {...props} type="button" data-open={open}><Gallery size={16} />Editar capa</button>}>
          {close => <>
            <div className="note-cover-picker-tabs" role="tablist" aria-label="Origem da capa">{([['gradients', 'Degradês'], ['link', 'Link']] as const).map(([value, label]) => <button type="button" role="tab" aria-selected={tab === value} key={value} onClick={() => { setTab(value); setError(''); }}>{label}</button>)}</div>
            <div className="note-cover-picker-body" role="tabpanel" aria-label={tab === 'gradients' ? 'Degradês' : 'Link'}>
              {tab === 'gradients' ? <div className="note-cover-gradient-grid">{coverGradients.map(item => <button type="button" key={item.id} aria-label={`Capa ${item.name}`} aria-pressed={!note.cover && gradient.id === item.id} style={{ background: item.color }} onClick={() => { onUpdate({ cover: undefined, coverGradient: item.id, coverPosition: undefined }); close(); }} />)}</div> : <form onSubmit={event => {
                event.preventDefault();
                try { const value = new URL(url.trim()); if (!['http:', 'https:'].includes(value.protocol)) throw new Error('Invalid URL'); saveImage(value.href); close(); }
                catch { setError('Use um link de imagem válido, começando com https:// ou http://.'); }
              }}><input className="note-picker-input" aria-label="Link da imagem" type="url" placeholder="https://…" value={url} onChange={event => { setUrl(event.target.value); setError(''); }} /><div className="note-cover-link-footer"><span>Cole o link de uma imagem.</span><button className="primary-button" type="submit" disabled={!url.trim() || loading}>Aplicar</button></div></form>}
              {error && <p role="alert" className="note-picker-error">{error}</p>}
              {loading && <p role="status">Carregando imagem…</p>}
            </div>
            <div className="note-cover-picker-footer"><label className="note-cover-upload"><Gallery size={16} />{loading ? 'Carregando…' : 'Enviar imagem'}<input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={loading} onChange={event => void upload(event.target.files?.[0], close)} /></label><button type="button" disabled={loading} onClick={() => { onUpdate(noteFieldPatch('cover', false)); close(); }}>Remover</button></div>
          </>}
        </NotePopover>
        {image && <button type="button" onClick={() => setRepositioning(true)}>Reposicionar</button>}
      </>}
    </div>
  </div>;
}
