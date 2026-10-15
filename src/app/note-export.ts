import type { Note } from '../data';

export function exportMarkdown(n: Note) { const blob = new Blob([`# ${n.title || 'Sem título'}\n\n${n.body}`], { type: 'text/markdown;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${(n.title || 'Sem título').replace(/[<>:"/\\|?*]/g, '-')}.md`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export function exportPdf(n: Note) {
    const previousTitle = document.title;
    document.title = (n.title || 'Sem título').replace(/[<>:"/\\|?*]/g, '-');
    const restoreTitle = () => { document.title = previousTitle; };
    window.addEventListener('afterprint', restoreTitle, { once: true });
    window.print();
    window.setTimeout(() => {
      if (document.title !== previousTitle) restoreTitle();
    }, 1000);
  }
