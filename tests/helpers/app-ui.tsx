import type { ComponentProps } from 'react';
import type { AppSidebar as Sidebar } from '../../src/app/AppSidebar';
import type { NotesLibrary as Library } from '../../src/app/NotesLibrary';
import type { NoteEditor as Editor } from '../../src/app/NoteEditor';
import type { NoteToolbar as Toolbar } from '../../src/app/NoteToolbar';
import type { AppDialogs as Dialogs } from '../../src/app/AppDialogs';
import type { ToastStack as Toasts } from '../../src/Feedback';
import type { AnimatedDialog as Dialog } from '../../src/AnimatedDialog';
import type { IconButton as Button } from '../../src/IconButton';

// Integration boundaries only: App, state hooks, persistence and Drive logic
// remain real. Browser layout, Tiptap and popover rendering are out of scope.
export function AppSidebar(_props: ComponentProps<typeof Sidebar>) { return null; }
export function NotesLibrary(_props: ComponentProps<typeof Library>) { return null; }
export function NoteEditor(_props: ComponentProps<typeof Editor>) { return null; }
export const preloadRichNote = async () => {};
export function NoteToolbar(_props: ComponentProps<typeof Toolbar>) { return null; }
export function AppDialogs(_props: ComponentProps<typeof Dialogs>) { return null; }
export function ToastStack(_props: ComponentProps<typeof Toasts>) { return null; }
export function AnimatedDialog(props: ComponentProps<typeof Dialog>) {
  return props.open ? <section>{props.children}</section> : null;
}
export function IconButton(props: ComponentProps<typeof Button>) { return <button {...props} />; }
