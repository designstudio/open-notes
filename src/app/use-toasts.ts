import { useCallback, useRef, useState } from 'react';
import type { ToastEvent } from '../Feedback';

export function useToasts() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);
  const toastId = useRef(0);
  const setToast = useCallback((message: string, kind: 'success' | 'error' = 'success', action?: ToastEvent['action']) => {
    const event = { id: ++toastId.current, message, kind, createdAt: Date.now(), action };
    setToasts([event]);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts(current => current.filter(event => event.id !== id)), []);
  return { toasts, setToast, dismissToast };
}
export type Notify = ReturnType<typeof useToasts>['setToast'];
