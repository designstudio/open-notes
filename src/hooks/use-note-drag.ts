import { useRef, useState, type DragEvent } from 'react';

const noteDragType = 'application/x-open-notes-note';

export function useNoteDrag(onMove: (noteId: string, collectionId: string) => void) {
  const source = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overCollection, setOverCollection] = useState<string | null>(null);

  function reset() {
    source.current = null;
    setDraggingId(null);
    setOverCollection(null);
  }

  function isNoteDrag(event: DragEvent) {
    return source.current !== null && event.dataTransfer.types.includes(noteDragType);
  }

  function sourceProps(noteId: string) {
    return {
      draggable: true,
      onDragStart(event: DragEvent<HTMLElement>) {
        source.current = noteId;
        event.dataTransfer.setData(noteDragType, noteId);
        event.dataTransfer.effectAllowed = 'move';
        setDraggingId(noteId);
      },
      onDragEnd: reset,
    };
  }

  function targetProps(collectionId: string) {
    return {
      onDragOver(event: DragEvent<HTMLDivElement>) {
        if (!isNoteDrag(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setOverCollection(collectionId);
      },
      onDragLeave(event: DragEvent<HTMLDivElement>) {
        if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
        setOverCollection(current => current === collectionId ? null : current);
      },
      onDrop(event: DragEvent<HTMLDivElement>) {
        if (!isNoteDrag(event)) return;
        event.preventDefault();
        event.stopPropagation();
        const noteId = event.dataTransfer.getData(noteDragType);
        if (noteId === source.current) onMove(noteId, collectionId);
        reset();
      },
    };
  }

  return { draggingId, overCollection, sourceProps, targetProps };
}
