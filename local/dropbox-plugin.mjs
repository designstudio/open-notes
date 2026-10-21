import { createCredentialVault } from './credential-vault.mjs';
import { createDropboxAuth } from './dropbox-auth.mjs';
import { createDropboxMiddleware } from './dropbox-middleware.mjs';

/** Same local API in dev and preview. Never bundled into the React application. */
export function dropboxLocalAuth() {
  const attach = server => {
    let middleware, auth;
    server.middlewares.use((req, res, next) => {
      if (!req.url?.startsWith('/api/dropbox/')) return next();
      if (!middleware) {
        const port = server.httpServer?.address()?.port;
        if (!port) { res.writeHead(503); return res.end(); }
        auth = createDropboxAuth({ vault: createCredentialVault({ target: `OpenNotes.Dropbox.Auth.v1.Port.${port}` }) });
        middleware = createDropboxMiddleware({ auth, port: () => port });
      }
      return middleware(req, res, next);
    });
    server.httpServer?.once('close', () => auth?.dispose());
  };
  return { name: 'open-notes-local-dropbox-auth', configureServer: attach, configurePreviewServer: attach };
}
