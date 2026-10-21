// Only this fixed snapshot is exposed. Never accept a caller-supplied URL or path.
export const snapshotPath = '/open-notes-snapshot.json';
export const maxSnapshotBytes = 20 * 1024 * 1024;
export class DropboxFileError extends Error {
  constructor(kind, message) { super(message); this.kind = kind; }
}
export function createDropboxFiles({ auth, fetch: request = globalThis.fetch }) {
  async function call(operation, snapshot, revision) {
    return auth.authorized(async token => {
      const upload = operation === 'upload';
      const args = upload ? { path: snapshotPath, mode: revision === null ? { '.tag': 'add' } : { '.tag': 'update', update: revision },
        autorename: false, strict_conflict: true, mute: true } : { path: snapshotPath };
      const response = await request(`https://content.dropboxapi.com/2/files/${operation}`, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30000),
        headers: { Authorization: `Bearer ${token}`, 'Dropbox-API-Arg': JSON.stringify(args),
          ...(upload ? { 'Content-Type': 'application/octet-stream' } : {}) },
        ...(upload ? { body: JSON.stringify(snapshot) } : {}),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (!upload && response.status === 409 && error.error?.['.tag'] === 'path' && error.error.path?.['.tag'] === 'not_found') return null;
        const isConflict = error.error?.['.tag'] === 'path' && (error.error.path?.reason?.['.tag'] === 'conflict'
          || String(error.error_summary || '').startsWith('path/conflict/'));
        const kind = response.status === 409 && isConflict ? 'conflict' : response.status === 401 ? 'authorization'
          : response.status === 403 ? 'permission' : response.status === 429 ? 'quota' : 'network';
        throw new DropboxFileError(kind, kind === 'permission' ? 'Habilite files.content.read e files.content.write na App Console e vincule novamente.'
          : kind === 'conflict' ? 'A cópia do Dropbox mudou. Compare as versões novamente.'
          : kind === 'quota' ? 'O Dropbox atingiu um limite de uso. Tente mais tarde.' : 'Não foi possível acessar a cópia do Dropbox. Suas notas continuam salvas neste navegador.');
      }
      if (upload) {
        const result = await response.json();
        if (typeof result.rev !== 'string' || !result.rev) throw new DropboxFileError('invalid', 'O Dropbox não confirmou a revisão gravada. Compare novamente antes de enviar.');
        return { revision: result.rev };
      }
      let metadata;
      try { metadata = JSON.parse(response.headers.get('Dropbox-API-Result') || 'null'); }
      catch { throw new DropboxFileError('invalid', 'A revisão da cópia do Dropbox não foi reconhecida.'); }
      if (typeof metadata?.rev !== 'string' || !metadata.rev) throw new DropboxFileError('invalid', 'A revisão da cópia do Dropbox não foi reconhecida.');
      // Stream with a bound rather than buffering arbitrarily large remote files.
      const reader = response.body.getReader();
      const chunks = []; let size = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read(); if (done) break;
          size += value.byteLength;
          if (size > maxSnapshotBytes) { await reader.cancel(); throw new DropboxFileError('size', 'A cópia excede o limite de 20 MiB. Nenhum dado foi substituído.'); }
          chunks.push(Buffer.from(value));
        }
      } finally { reader.releaseLock(); }
      try { return { revision: metadata.rev, snapshot: JSON.parse(Buffer.concat(chunks).toString('utf8')) }; }
      catch { throw new DropboxFileError('invalid', 'A cópia do Dropbox contém JSON inválido. Nenhum dado foi substituído.'); }
    });
  }
  return { download: () => call('download'), upload: (snapshot, revision) => {
    if ((revision !== null && (typeof revision !== 'string' || !/^[a-zA-Z0-9]{1,128}$/.test(revision))) ||
      !snapshot || snapshot.schemaVersion !== 1 || !Number.isFinite(snapshot.updatedAt) || !snapshot.data ||
      !['notes', 'collections', 'folders'].every(key => Array.isArray(snapshot.data[key]))) throw new DropboxFileError('invalid', 'Snapshot inválido.');
    if (Buffer.byteLength(JSON.stringify(snapshot)) > maxSnapshotBytes) throw new DropboxFileError('size', 'A cópia excede o limite de 20 MiB. Suas notas continuam locais.');
    return call('upload', snapshot, revision);
  } };
}
