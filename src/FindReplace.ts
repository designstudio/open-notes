import { Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, type EditorState, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { closeHistory } from '@tiptap/pm/history';

export type FindMatch = { from: number; to: number };
type FindState = { query: string; matches: FindMatch[]; active: number; decorations: DecorationSet };
type FindMeta = { query?: string; active?: number; activeFrom?: number };
export const findKey = new PluginKey<FindState>('noteFind');

// Search visible text, including words split across formatting marks. Inline
// atoms and block boundaries separate runs so replacements cannot erase them.
export function findMatches(doc: ProseMirrorNode, query: string): FindMatch[] {
  if (!query) return [];
  const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu');
  const matches: FindMatch[] = [];
  doc.descendants((block, position) => {
    if (!block.isTextblock) return;
    let text = '';
    let start = position + 1;
    const flush = () => {
      pattern.lastIndex = 0;
      for (const match of text.matchAll(pattern)) {
        matches.push({ from: start + match.index!, to: start + match.index! + match[0].length });
      }
      text = '';
    };
    block.forEach((child, offset) => {
      if (child.isText) {
        if (!text) start = position + 1 + offset;
        text += child.text;
      } else flush();
    });
    flush();
    return false;
  });
  return matches;
}

export function createFindPlugin() {
  return new Plugin<FindState>({
    key: findKey,
    state: {
      init: () => ({ query: '', matches: [], active: -1, decorations: DecorationSet.empty }),
      apply(tr, previous) {
        const meta = tr.getMeta(findKey) as FindMeta | undefined;
        if (!meta && !tr.docChanged) return previous;
        const query = meta?.query ?? previous.query;
        const matches = tr.docChanged || query !== previous.query ? findMatches(tr.doc, query) : previous.matches;
        let active = meta?.active ?? (query !== previous.query ? 0 : previous.active);
        const anchor = meta?.activeFrom ?? (tr.docChanged && previous.matches[previous.active]
          ? tr.mapping.map(previous.matches[previous.active].from, -1) : undefined);
        if (anchor !== undefined) {
          active = matches.findIndex(match => match.from >= anchor);
          if (active < 0) active = 0;
        }
        active = matches.length ? Math.max(0, Math.min(active, matches.length - 1)) : -1;
        const decorations = DecorationSet.create(tr.doc, matches.map((match, index) =>
          Decoration.inline(match.from, match.to, { class: `note-find-match${index === active ? ' is-current' : ''}` }),
        ));
        return { query, matches, active, decorations };
      },
    },
    props: { decorations: state => findKey.getState(state)?.decorations },
  });
}

export const FindReplace = Extension.create({
  name: 'noteFind',
  addProseMirrorPlugins: () => [createFindPlugin()],
});

export function replaceMatches(state: EditorState, replacement: string, all: boolean): Transaction | null {
  const search = findKey.getState(state);
  if (!search?.matches.length) return null;
  const targets = all ? search.matches : [search.matches[search.active]];
  const tr = closeHistory(state.tr);
  // Work backwards so earlier document positions remain valid. Insert text
  // nodes directly: replacement strings are never interpreted as HTML/Markdown.
  for (const { from, to } of [...targets].reverse()) {
    if (replacement) tr.replaceWith(from, to, state.schema.text(replacement, state.doc.nodeAt(from)?.marks));
    else tr.delete(from, to);
  }
  return tr.setMeta(findKey, { activeFrom: all ? 0 : targets[0].from + replacement.length } satisfies FindMeta);
}
