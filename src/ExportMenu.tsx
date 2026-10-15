import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Download, FilePdf, FileText } from './icons';
import { IconButton } from './IconButton';

export function ExportMenu({ onMarkdown, onPdf }: { onMarkdown: () => void; onPdf: () => void }) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <IconButton className="icon-button" aria-label="Exportar nota" title="Exportar">
          <Download size={18} />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="note-actions-menu export-menu t-dropdown" align="end" sideOffset={10} collisionPadding={12}>
          <DropdownMenu.Label className="note-actions-label">Exportar como</DropdownMenu.Label>
          <DropdownMenu.Item className="note-action" onSelect={onMarkdown}>
            <FileText size={18} /><span>Markdown</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="note-action" onSelect={() => window.setTimeout(onPdf, 0)}>
            <FilePdf size={18} /><span>PDF</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
