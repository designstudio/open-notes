/** Tokens belong exclusively to the local process and the OS credential vault. */
export type DropboxConnectionState =
  | { status: 'unavailable'; reason: 'local-service-required' }
  | { status: 'disconnected' | 'connecting' | 'connected' | 'disconnecting' }
  | { status: 'error'; message: string };

// Static/unsupported hosts remain unavailable until the local service responds.
export const dropboxIntegrationState: DropboxConnectionState = Object.freeze({
  status: 'unavailable',
  reason: 'local-service-required',
});

export function dropboxConnectionLabel(state: DropboxConnectionState): string {
  switch (state.status) {
    case 'unavailable': return 'Indisponível';
    case 'disconnected': return 'Desconectado';
    case 'connecting': return 'Conectando…';
    case 'connected': return 'Conectado';
    case 'disconnecting': return 'Desconectando…';
    case 'error': return 'A conexão precisa de atenção';
  }
}
