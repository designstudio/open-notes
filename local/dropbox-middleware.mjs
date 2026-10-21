import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createDropboxFiles, DropboxFileError, maxSnapshotBytes } from './dropbox-files.mjs';

const prefix = '/api/dropbox/';
const cookieName = 'open_notes_dropbox';
const lifetime = 12 * 60 * 60 * 1000;
const random = () => randomBytes(32).toString('base64url');
function same(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** All control endpoints are same-origin authenticated POSTs; callback uses single-use OAuth state. */
export function createDropboxMiddleware({ auth, port, now = Date.now, files = createDropboxFiles({ auth }) }) {
  const sessions = new Map();
  return async (req, res, next) => {
    if (!req.url?.split('?')[0].startsWith(prefix)) return next();
    const send = (code, value) => {
      res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
      res.end(JSON.stringify(value));
    };
    try {
      const host = req.headers.host;
      const address = req.socket.remoteAddress;
      if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address) ||
        ![`127.0.0.1:${port()}`, `localhost:${port()}`, `[::1]:${port()}`].includes(host)) {
        return send(403, { message: 'Acesso local não autorizado.' });
      }
      const origin = `http://${host}`;
      const url = new URL(req.url, origin);
      for (const [id, session] of sessions) if (session.expiresAt <= now()) sessions.delete(id);
      if (url.pathname === prefix + 'callback' && req.method === 'GET') {
        const success = await auth.complete(url.searchParams, origin, id => sessions.get(id)?.origin === origin);
        res.writeHead(303, { Location: prefix + `result?success=${success ? '1' : '0'}`, 'Cache-Control': 'no-store',
          'Referrer-Policy': 'no-referrer' });
        return res.end();
      }
      if (url.pathname === prefix + 'result' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
          'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
          'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
        return res.end('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Open Notes — Dropbox</title>' +
          '<p>' + (url.searchParams.get('success') === '1' ? 'Dropbox autorizado. Nenhuma nota foi sincronizada.'
            : 'Não foi possível concluir a autorização. Volte às Preferências para tentar novamente.') +
          '</p><p>Você pode fechar esta aba e voltar ao Open Notes.</p></html>');
      }
      // No CORS response is ever emitted, including for preflight requests.
      if (req.method !== 'POST' || req.headers.origin !== origin ||
        req.headers['sec-fetch-site'] !== 'same-origin' || req.headers['x-open-notes'] !== 'dropbox' ||
        req.headers['content-type']?.split(';')[0] !== 'application/json') {
        return send(403, { message: 'Requisição não autorizada.' });
      }
      const cookies = req.headers.cookie || '';
      const cookie = cookies.split(';').map(item => item.trim()).find(item => item.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
      let session = sessions.get(cookie);
      if (session?.origin !== origin) session = undefined;
      if (url.pathname !== prefix + 'session' && (!session || !same(req.headers['x-csrf-token'], session.csrf))) {
        return send(403, { message: 'A sessão local expirou. Reabra as Preferências.' });
      }
      let size = 0, raw = '';
      for await (const chunk of req) {
        size += chunk.length;
        if (size > (url.pathname === prefix + 'upload' ? maxSnapshotBytes + 1024 : 2048)) return send(413, { message: 'Requisição muito grande. Suas notas continuam locais.' });
        raw += chunk;
      }
      let body;
      try { body = JSON.parse(raw || '{}'); } catch { return send(400, { message: 'Requisição inválida.' }); }
      if (url.pathname === prefix + 'session') {
        let id = cookie;
        if (!session) {
          if (sessions.size >= 64) sessions.delete(sessions.keys().next().value);
          id = random(); session = { origin, csrf: random(), expiresAt: now() + lifetime };
          sessions.set(id, session);
          res.setHeader('Set-Cookie', `${cookieName}=${id}; HttpOnly; SameSite=Strict; Path=/api/dropbox; Max-Age=${lifetime / 1000}`);
        }
        return send(200, { ...(await auth.snapshot(origin)), csrf: session.csrf });
      }
      if (url.pathname === prefix + 'connect') {
        try { return send(200, await auth.begin(body.appKey, origin, cookie)); }
        catch { return send(400, { message: 'Não foi possível iniciar a autorização. Verifique a App Key e o cofre local.' }); }
      }
      if (url.pathname === prefix + 'disconnect') return send(200, await auth.disconnect(origin));
      if (url.pathname === prefix + 'permissions') return send(200, await auth.verifyPermissions(origin));
      if (url.pathname === prefix + 'download' || url.pathname === prefix + 'upload') {
        try { return send(200, url.pathname.endsWith('/download') ? await files.download() : await files.upload(body.snapshot, body.revision)); }
        catch (error) { return send(error instanceof DropboxFileError && error.kind === 'conflict' ? 409 : 400,
          { kind: error instanceof DropboxFileError ? error.kind : 'authorization',
            message: error instanceof DropboxFileError ? error.message : 'Verifique a conexão e as permissões do Dropbox. Pode ser necessário desvincular e autorizar novamente.' }); }
      }
      return send(404, { message: 'Operação não disponível.' });
    } catch { return send(500, { message: 'O serviço local do Dropbox não conseguiu concluir a operação.' }); }
  };
}
