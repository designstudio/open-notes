import { useCallback, useEffect, useRef, useState } from 'react';
import { dropboxIntegrationState, type DropboxConnectionState } from './dropbox-integration';

type Session = {
  status: DropboxConnectionState['status']; message: string | null;
  appKey: string; linked: boolean; revocationPending: boolean; callbackUri: string; csrf: string; syncReady?: boolean; connectionId?: string;
};

export function useDropboxAuth() {
  const [state, setState] = useState<DropboxConnectionState>(dropboxIntegrationState);
  const [appKey, setAppKey] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const mounted = useRef(false), epoch = useRef(0), busy = useRef(false);
  const csrf = useRef(''), popup = useRef<Window | null>(null), draftEdited = useRef(false);

  const request = useCallback(async (path: string, body = {}) => {
    const response = await fetch(`/api/dropbox/${path}`, {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-Open-Notes': 'dropbox', 'X-CSRF-Token': csrf.current },
      body: JSON.stringify(body), signal: AbortSignal.timeout(path === 'download' || path === 'upload' ? 90000 : 20000),
    });
    if (!response.ok) {
      const value = await response.json().catch(() => ({}));
      throw Object.assign(new Error(value.message || 'Não foi possível acessar o serviço local do Dropbox. Reabra as Preferências e tente novamente.'), { kind: value.kind });
    }
    return response.json();
  }, []);
  const apply = useCallback((value: Session) => {
    csrf.current = value.csrf || csrf.current;
    setSession(value);
    if (!draftEdited.current) setAppKey(value.appKey);
    setState(value.status === 'error' ? { status: 'error', message: value.message || 'A conexão precisa de atenção.' }
      : value.status === 'unavailable' ? { status: 'unavailable', reason: 'local-service-required' }
      : { status: value.status });
  }, []);
  const refresh = useCallback(async () => {
    const version = epoch.current;
    try {
      const value = await request('session') as Session;
      if (!mounted.current || version !== epoch.current) return;
      // A closed/cancelled popup must not leave the UI connecting indefinitely.
      if (value.status === 'connecting' && popup.current?.closed) {
        const cancelled = await request('disconnect');
        if (mounted.current && version === epoch.current) apply(cancelled);
      } else apply(value);
    } catch {
      if (mounted.current && version === epoch.current) {
        setState({ status: 'unavailable', reason: 'local-service-required' });
      }
    } finally { if (mounted.current && version === epoch.current) setChecking(false); }
  }, [request, apply]);
  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => { mounted.current = false; epoch.current++; };
  }, [refresh]);
  useEffect(() => {
    const timer = window.setInterval?.(() => { if (!busy.current) void refresh(); },
      state.status === 'connecting' || session?.revocationPending ? 2500 : 30000);
    const online = () => { if (!busy.current) void refresh(); };
    window.addEventListener('online', online);
    return () => { window.clearInterval?.(timer); window.removeEventListener('online', online); };
  }, [state.status, session?.revocationPending, refresh]);
  const connect = useCallback(async () => {
    if (busy.current || !csrf.current) return;
    // Open synchronously from the click to preserve the browser's user gesture.
    const windowRef = window.open('about:blank', '_blank', 'popup,width=600,height=720');
    if (!windowRef) { setState({ status: 'error', message: 'Permita a janela de autorização do Dropbox e tente novamente.' }); return; }
    windowRef.opener = null;
    popup.current = windowRef;
    const version = ++epoch.current;
    busy.current = true; setState({ status: 'connecting' });
    try {
      const value = await request('connect', { appKey: appKey.trim() });
      const url = new URL(value.authorizationUrl);
      if (url.origin !== 'https://www.dropbox.com' || url.pathname !== '/oauth2/authorize') throw new Error('Endereço de autorização inválido.');
      windowRef.location.href = url.href;
    } catch (error) {
      windowRef.close();
      if (mounted.current && version === epoch.current) setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível conectar.' });
    } finally { busy.current = false; }
  }, [appKey, request]);
  const verifyPermissions = useCallback(async () => {
    if (busy.current || !csrf.current) return;
    const version = ++epoch.current;
    busy.current = true;
    try {
      const value = await request('permissions');
      if (mounted.current && version === epoch.current) apply(value);
    } catch (error) {
      if (mounted.current && version === epoch.current) setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível verificar as permissões.' });
    } finally { busy.current = false; }
  }, [request, apply]);
  const disconnect = useCallback(async () => {
    if (busy.current || !csrf.current) return;
    const version = ++epoch.current;
    busy.current = true; setState({ status: 'disconnecting' });
    popup.current?.close(); popup.current = null;
    try {
      const value = await request('disconnect');
      if (mounted.current && version === epoch.current) apply(value);
    } catch (error) {
      if (mounted.current && version === epoch.current) setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível revogar a autorização.' });
    } finally { busy.current = false; }
  }, [request, apply]);
  return { state, checking, appKey, setAppKey: (key: string) => { draftEdited.current = true; setAppKey(key); },
    linked: Boolean(session?.linked), revocationPending: Boolean(session?.revocationPending),
    callbackUri: session?.callbackUri || '', serviceMessage: session?.message,
    syncReady: Boolean(session?.syncReady), connectionId: session?.connectionId || '', request, connect, disconnect, verifyPermissions };
}
