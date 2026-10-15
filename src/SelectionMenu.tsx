import { useCallback, useMemo, useState } from 'react';
import { isTextSelection, type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { IconButton } from './IconButton';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlight,
  ForbiddenCircle,
  Quote,
  Link,
  ChevronDown,
  Check,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from './icons';
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/tiptap-ui-primitive/dropdown-menu';

export function SelectionMenu({ editor }: { editor: Editor }) {
  const [panel, setPanel] = useState<'link' | null>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const shouldShow = useCallback(
    ({ state, from, to }: { state: any; from: number; to: number }) => {
      const { doc, selection } = state;
      const { empty } = selection;
      const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(selection);

      if (empty || isEmptyTextBlock || !editor.isEditable) {
        return false;
      }

      // Se algum dropdown do tiptap estiver aberto, manter o BubbleMenu visível
      const hasOpenDropdown = !!document.querySelector(
        '[data-slot="tiptap-dropdown-menu-content"][data-state="open"]'
      );
      if (hasOpenDropdown) {
        return true;
      }

      const isChildOfMenu =
        document.activeElement &&
        (document.querySelector('.selection-menu')?.contains(document.activeElement) ||
          document.querySelector('[data-slot="tiptap-dropdown-menu-content"]')?.contains(document.activeElement));

      return editor.view.hasFocus() || !!isChildOfMenu;
    },
    [editor]
  );

  const options = useMemo(() => ({
    placement: 'top' as const,
    offset: 12,
    flip: { padding: 12 },
    shift: { padding: 12 },
    onHide: () => setPanel(null),
    onUpdate: () => {
      const menu = document.querySelector<HTMLElement>('.selection-menu')?.parentElement;
      if (menu) {
        const left = parseFloat(menu.style.left);
        const top = parseFloat(menu.style.top);
        if (!isNaN(left)) menu.style.left = `${Math.round(left)}px`;
        if (!isNaN(top)) menu.style.top = `${Math.round(top)}px`;
      }
    },
  }), []);

  const alignments = [
    { value: 'left', label: 'À esquerda', icon: AlignLeft },
    { value: 'center', label: 'Centralizado', icon: AlignCenter },
    { value: 'right', label: 'À direita', icon: AlignRight },
    { value: 'justify', label: 'Justificado', icon: AlignJustify },
  ] as const;

  const activeAlign = alignments.find(item => editor.isActive({ textAlign: item.value })) || alignments[0];
  const CurrentAlignIcon = activeAlign.icon;

  const colors = [
    { name: 'Amarelo', color: '#fef08a' },
    { name: 'Verde', color: '#bbf7d0' },
    { name: 'Azul', color: '#bfdbfe' },
    { name: 'Rosa', color: '#fbcfe8' },
    { name: 'Lilás', color: '#ddd6fe' },
  ];

  return (
    <BubbleMenu editor={editor} updateDelay={80} options={options} shouldShow={shouldShow}>
      <div
        className="selection-menu dark"
        onMouseDown={e => { if ((e.target as HTMLElement).closest('button')) e.preventDefault(); }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.preventDefault();
            setPanel(null);
            editor.chain().focus().setTextSelection(editor.state.selection.to).run();
          }
          if (['ArrowLeft', 'ArrowRight'].includes(e.key) && e.target instanceof HTMLButtonElement) {
            const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('.selection-tools button:not(:disabled)')];
            const index = buttons.indexOf(e.target);
            if (index >= 0) {
              e.preventDefault();
              buttons[(index + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length]?.focus();
            }
          }
        }}
      >
        <div className="selection-tools" role="toolbar" aria-label="Formatar seleção">
          <HeadingDropdownMenu editor={editor} levels={[1, 2, 3, 4]} modal={false} aria-label="Títulos" tooltip="Títulos" tabIndex={0} />
          <span className="selection-divider" />
          <IconButton aria-label="Negrito" title="Negrito (Ctrl+B)" aria-pressed={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={16} />
          </IconButton>
          <IconButton aria-label="Itálico" title="Itálico (Ctrl+I)" aria-pressed={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={16} />
          </IconButton>
          <IconButton aria-label="Sublinhado" title="Sublinhado (Ctrl+U)" aria-pressed={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <Underline size={16} />
          </IconButton>
          <IconButton aria-label="Tachado" title="Tachado" aria-pressed={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough size={16} />
          </IconButton>
          <IconButton aria-label="Código" title="Código" aria-pressed={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code size={16} />
          </IconButton>
          <span className="selection-divider" />
          <ListDropdownMenu editor={editor} modal={false} aria-label="Listas" tooltip="Listas" tabIndex={0} />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <IconButton aria-label="Alinhamento" title="Alinhamento">
                <CurrentAlignIcon width={16} height={16} />
                <ChevronDown size={10} />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" aria-label="Alinhamento">
              {alignments.map(item => (
                <DropdownMenuItem key={item.value} asChild>
                  <TextAlignButton editor={editor} align={item.value} text={item.label} aria-label={item.label} showTooltip={false} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu modal={false} onOpenChange={open => { if (open) setPanel(null); }}>
            <DropdownMenuTrigger asChild>
              <IconButton aria-label="Cor de destaque" title="Cor de destaque" aria-pressed={editor.isActive('highlight')}>
                <Highlight size={16} /><ChevronDown size={10} />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="selection-highlight-menu" aria-label="Cores de destaque">
              <div className="selection-highlight-grid">
                {colors.map(item => (
                  <DropdownMenuItem key={item.color} asChild onSelect={() => editor.chain().focus().setHighlight({ color: item.color }).run()}>
                    <button type="button" className="selection-highlight-swatch" aria-label={`Destaque ${item.name.toLowerCase()}`} title={item.name} data-selected={editor.isActive('highlight', { color: item.color })}>
                      <span style={{ backgroundColor: item.color }} aria-hidden="true">
                        {editor.isActive('highlight', { color: item.color }) && <Check size={14} />}
                      </span>
                    </button>
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="selection-highlight-divider" role="separator" />
              <DropdownMenuItem asChild onSelect={() => editor.chain().focus().unsetHighlight().run()}>
                <button type="button" className="selection-highlight-clear" aria-label="Remover destaque" title="Remover destaque">
                  <ForbiddenCircle size={18} />
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <IconButton aria-label="Citação" title="Citação" aria-pressed={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote size={16} />
          </IconButton>
          <span className="selection-divider" />
          <IconButton
            aria-label="Inserir ou editar link"
            title="Link"
            aria-pressed={editor.isActive('link')}
            aria-expanded={panel === 'link'}
            onClick={() => {
              setUrl(editor.getAttributes('link').href || '');
              setError('');
              setPanel(p => p === 'link' ? null : 'link');
            }}
          >
            <Link size={16} />
          </IconButton>
        </div>
        {panel === 'link' && (
          <form
            className="selection-link"
            onSubmit={e => {
              e.preventDefault();
              const value = url.trim();
              if (!value) {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                setPanel(null);
                return;
              }
              const normalized = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
              try {
                const parsed = new URL(normalized);
                if (!['https:', 'http:', 'mailto:'].includes(parsed.protocol)) throw new Error();
              } catch {
                setError('Use um link http, https ou mailto válido.');
                return;
              }
              editor.chain().focus().extendMarkRange('link').setLink({ href: normalized }).run();
              setPanel(null);
            }}
          >
            <div>
              <input
                autoFocus
                type="text"
                aria-label="Endereço do link"
                placeholder="https://exemplo.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <IconButton type="submit" aria-label="Aplicar link" title="Aplicar link">
                <Check size={16} />
              </IconButton>
              <IconButton
                type="button"
                aria-label="Remover link"
                title="Remover link"
                onClick={() => {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  setPanel(null);
                }}
              >
                <X size={16} />
              </IconButton>
            </div>
            {error && <p role="alert">{error}</p>}
          </form>
        )}
      </div>
    </BubbleMenu>
  );
}
