import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { TableKit } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import type { JSONContent } from '@tiptap/core';
import { Indent } from './Indent';
import { SelectionMenu } from './SelectionMenu';
import { NoteOutline } from './NoteOutline';
import { FindReplace } from './FindReplace';
import { NoteFind } from './NoteFind';
import './note-outline.css';

export function RichNote({ content, noteTitle, document: savedDocument, onChange, findOpen, onFindOpenChange, showOutline = true }: { content: string; noteTitle: string; document?: JSONContent; onChange: (markdown: string, document: JSONContent) => void; findOpen: boolean; onFindOpenChange: (open: boolean) => void; showOutline?: boolean }) {
  // The parent keys this editor by note ID. Do not reset content on each save:
  // preserving the editor instance keeps the cursor, selection and undo history.
  const editor = useEditor({
    extensions: [
      FindReplace,
      TextAlign.configure({ types: ['heading', 'paragraph'] }), Highlight.configure({ multicolor: true }), Indent,
      StarterKit.configure({ link: { openOnClick: false } }),
      TaskList, TaskItem.configure({ nested: true, a11y: { checkboxLabel: node => node.textContent || 'Tarefa sem título' } }), TableKit, Image,
      Placeholder.configure({ placeholder: 'Comece a escrever…' }),
      Markdown.configure({ markedOptions: { gfm: true } }),
    ],
    content: savedDocument || content,
    ...(savedDocument ? {} : { contentType: 'markdown' as const }),
    shouldRerenderOnTransaction: true,
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (event.altKey && event.key === 'F10') { const button = document.querySelector<HTMLButtonElement>('.selection-tools button'); if (button) { event.preventDefault(); button.focus(); return true; } }
        return false;
      },
      attributes: { class: 'markdown-body live-note', role: 'textbox', 'aria-label': 'Conteúdo da nota', 'aria-multiline': 'true', spellcheck: 'true' },
    },
    onUpdate: ({ editor }) => onChange(editor.getMarkdown(), editor.getJSON()),
  });

  return <div className="rich-note-shell">
    {editor && <>
      <SelectionMenu editor={editor} />
      {showOutline && <NoteOutline editor={editor} noteTitle={noteTitle} />}
      <NoteFind editor={editor} open={findOpen} onOpenChange={onFindOpenChange} />
    </>}
    <EditorContent editor={editor} />
  </div>;
}
