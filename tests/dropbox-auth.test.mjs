import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { createServer, request as httpRequest } from 'node:http';
import { createDropboxAuth, callbackPath } from '../local/dropbox-auth.mjs';
import { createDropboxMiddleware } from '../local/dropbox-middleware.mjs';
import { VaultUnavailable } from '../local/credential-vault.mjs';

// All credentials below are synthetic fixtures. No Dropbox network calls occur.
const appKey = 'personalTestAppKey';
const origin = 'http://127.0.0.1:5173';
function fixture(saved = null) {
  let stored = saved, clock = 10_000, unavailable = false, tokenFailure = null, revokeFailure = false, refreshScope;
  const requests = [], timers = new Map();
  let nextTimer = 0;
  const vault = {
    async probe() { if (unavailable) throw new VaultUnavailable(); },
    async read() { if (unavailable) throw new VaultUnavailable(); return structuredClone(stored); },
    async write(value) { if (unavailable) throw new VaultUnavailable(); stored = structuredClone(value); },
  };
  const fetch = async (url, options) => {
    requests.push({ url, ...options });
    assert.ok([ 'https://api.dropboxapi.com/oauth2/token', 'https://api.dropboxapi.com/2/auth/token/revoke' ].includes(url), 'no files or account operations are allowed');
    if (url.endsWith('/revoke')) return new Response('', { status: revokeFailure ? 503 : 200 });
    if (tokenFailure === 'network') throw new Error('synthetic network failure');
    if (tokenFailure) return Response.json({ error: tokenFailure, error_description: 'must never be returned to the browser' }, { status: 400 });
    const body = options.body;
    assert.equal(body.has('client_secret'), false);
    if (body.get('grant_type') === 'authorization_code') {
      return Response.json({ access_token: 'synthetic-initial-access', refresh_token: 'synthetic-refresh', expires_in: 3600,
        scope: 'files.metadata.read files.content.read files.content.write' });
    }
    assert.equal(body.get('grant_type'), 'refresh_token');
    assert.equal(body.get('client_id'), appKey);
    return Response.json({ access_token: 'synthetic-renewed-access', expires_in: 3600,
      ...(refreshScope !== undefined ? { scope: refreshScope } : {}) });
  };
  const make = () => createDropboxAuth({ vault, fetch, now: () => clock,
    schedule: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, at: clock + delay }); return id; },
    cancel: id => timers.delete(id) });
  return { make, requests, vault, stored: () => stored, now: () => clock,
    unavailable: value => { unavailable = value; }, tokenFailure: value => { tokenFailure = value; },
    revokeFailure: value => { revokeFailure = value; },
    refreshScope: value => { refreshScope = value; },
    async advance(ms) {
      clock += ms;
      const due = [...timers].filter(([, timer]) => timer.at <= clock);
      for (const [id, timer] of due) { timers.delete(id); timer.callback(); }
      await new Promise(resolve => setImmediate(resolve));
    },
  };
}
async function connect(auth, callbackOrigin = origin, sessionId = 'browser-session') {
  const { authorizationUrl } = await auth.begin(appKey, callbackOrigin, sessionId);
  const url = new URL(authorizationUrl);
  const parameters = new URLSearchParams({ state: url.searchParams.get('state'), code: 'synthetic-authorization-code' });
  assert.equal(await auth.complete(parameters, callbackOrigin, id => id === sessionId), true);
  return { url, parameters };
}

test('offline PKCE S256 uses the personal App Key and keeps tokens out of UI snapshots', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  const { url, parameters } = await connect(auth);
  assert.equal(url.searchParams.get('client_id'), appKey);
  assert.equal(url.searchParams.get('token_access_type'), 'offline');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('scope'), 'files.metadata.read files.content.read files.content.write');
  assert.equal(url.searchParams.get('redirect_uri'), origin + callbackPath);
  const verifier = env.requests[0].body.get('code_verifier');
  assert.ok(verifier.length >= 43);
  assert.equal(createHash('sha256').update(verifier).digest('base64url'), url.searchParams.get('code_challenge'));
  assert.equal(env.stored().refreshToken, 'synthetic-refresh');
  const snapshot = await auth.snapshot(origin);
  assert.equal(snapshot.status, 'connected');
  assert.doesNotMatch(JSON.stringify(snapshot), /synthetic-|refreshToken|access_token/);
  assert.equal(await auth.complete(parameters, origin, () => true), false, 'callback is single-use');
  assert.equal(env.requests.length, 1);
});

test('authorization restores after browser sessions and process restarts using the vault', async t => {
  const env = fixture(); const first = env.make();
  await connect(first); first.dispose();
  const restarted = env.make(); t.after(() => restarted.dispose());
  assert.equal((await restarted.snapshot(origin)).status, 'connected');
  assert.equal(env.requests.at(-1).body.get('grant_type'), 'refresh_token');
  assert.equal((await restarted.snapshot(origin)).status, 'connected');
  assert.equal(env.requests.length, 2, 'new browser session reuses the current local authorization');
});

test('renewal recovers scopes for old vault entries only when Dropbox confirms the actual grant', async t => {
  const old = { appKey, refreshToken: 'synthetic-refresh', revokePending: false, needsReconnect: false };
  const env = fixture(old), auth = env.make(); t.after(() => auth.dispose());
  const unknown = await auth.snapshot(origin);
  assert.equal(unknown.syncReady, false); assert.equal(unknown.connectionId, '');
  assert.equal(env.stored().scopes, undefined);
  env.refreshScope('files.metadata.read  files.content.read\tfiles.content.write');
  await env.advance(3540_000);
  const confirmed = await auth.snapshot(origin);
  assert.equal(confirmed.syncReady, true); assert.ok(confirmed.connectionId);
  assert.deepEqual(env.stored().scopes, ['files.metadata.read', 'files.content.read', 'files.content.write']);
  assert.doesNotMatch(JSON.stringify(confirmed), /synthetic-refresh|synthetic-renewed-access/);
  auth.dispose();
  const restored = env.make(); t.after(() => restored.dispose());
  assert.equal((await restored.snapshot(origin)).connectionId, confirmed.connectionId);
});

test('a metadata-only refresh response never enables note synchronization', async t => {
  const env = fixture({ appKey, refreshToken: 'synthetic-refresh', revokePending: false, needsReconnect: false });
  env.refreshScope('files.metadata.read');
  const auth = env.make(); t.after(() => auth.dispose());
  assert.equal((await auth.snapshot(origin)).syncReady, false);
  await assert.rejects(auth.authorized(async () => { throw new Error('must not reach file operation'); }), /metadados/);
});

test('manual permission verification renews a live token without revoking or accessing files', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose()); await connect(auth);
  const id = (await auth.snapshot(origin)).connectionId;
  env.refreshScope('files.metadata.read files.content.read files.content.write');
  const result = await auth.verifyPermissions(origin);
  assert.equal(result.syncReady, true); assert.equal(result.connectionId, id); assert.equal(result.status, 'connected');
  assert.equal(env.requests.length, 2); assert.equal(env.requests.at(-1).body.get('grant_type'), 'refresh_token');
  assert.equal(env.stored().refreshToken, 'synthetic-refresh');
  assert.doesNotMatch(JSON.stringify(result), /synthetic-refresh|synthetic-renewed-access/);
});

test('manual permission verification cannot bypass pending revocation', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose()); await connect(auth);
  env.revokeFailure(true); await auth.disconnect(origin);
  const count = env.requests.length;
  assert.equal((await auth.verifyPermissions(origin)).revocationPending, true);
  assert.equal(env.requests.length, count);
});

test('a rejected file access token renews once without exposing tokens or discarding the refresh grant', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose()); await connect(auth);
  let calls = 0;
  const result = await auth.authorized(async token => {
    calls++;
    if (calls === 1) throw Object.assign(new Error('HTTP 401'), { kind: 'authorization' });
    assert.equal(token, 'synthetic-renewed-access'); return 'file-result';
  });
  assert.equal(result, 'file-result'); assert.equal(calls, 2); assert.equal(env.stored().refreshToken, 'synthetic-refresh');
  assert.equal(env.requests.length, 2);
});

test('automatic renewal is single flight and preserves the original refresh token', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  await connect(auth);
  await env.advance(3540_000);
  await Promise.all([auth.snapshot(origin), auth.snapshot(origin), auth.snapshot(origin)]);
  assert.equal(env.requests.length, 2);
  assert.equal(env.stored().refreshToken, 'synthetic-refresh');
  assert.equal((await auth.snapshot(origin)).status, 'connected');
});

test('invalid_grant requires reconnect, sanitizes failures and does not loop', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  await connect(auth); env.tokenFailure('invalid_grant');
  await env.advance(3600_000);
  const state = await auth.snapshot(origin);
  assert.equal(state.status, 'error');
  assert.match(state.message, /Conecte novamente/);
  assert.doesNotMatch(state.message, /must never/);
  const calls = env.requests.length;
  await env.advance(3600_000); await auth.snapshot(origin);
  assert.equal(env.requests.length, calls);
});

test('transient renewal failure retries automatically without losing the authorization', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  await connect(auth); env.tokenFailure('network');
  await env.advance(3540_000);
  assert.equal((await auth.snapshot(origin)).status, 'error');
  assert.equal(env.stored().needsReconnect, false);
  env.tokenFailure(null); await env.advance(60_000);
  assert.equal((await auth.snapshot(origin)).status, 'connected');
});

test('unavailable or corrupt vault fails closed and can recover without browser storage', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  env.unavailable(true);
  assert.equal((await auth.snapshot(origin)).status, 'unavailable');
  await assert.rejects(auth.begin(appKey, origin, 'session'));
  assert.equal(env.requests.length, 0); assert.equal(env.stored(), null);
  env.unavailable(false);
  assert.equal((await auth.snapshot(origin)).status, 'disconnected');
  const corrupt = fixture({ appKey, refreshToken: 123 }); const other = corrupt.make(); t.after(() => other.dispose());
  assert.equal((await other.snapshot(origin)).status, 'unavailable');
  assert.equal(corrupt.requests.length, 0);
});

test('denial, wrong state/origin, expired attempts and disconnected sessions cannot authorize', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  let url = new URL((await auth.begin(appKey, origin, 'session')).authorizationUrl);
  const args = new URLSearchParams({ state: url.searchParams.get('state'), code: 'synthetic-code' });
  assert.equal(await auth.complete(new URLSearchParams({ state: 'wrong' }), origin, () => true), false);
  assert.equal(await auth.complete(args, 'http://localhost:5173', () => true), false);
  assert.equal(await auth.complete(args, origin, () => false), false);
  args.set('error', 'access_denied');
  assert.equal(await auth.complete(args, origin, () => true), false);
  assert.match((await auth.snapshot(origin)).message, /cancelada/);
  url = new URL((await auth.begin(appKey, origin, 'session')).authorizationUrl);
  await env.advance(301_000);
  assert.equal(await auth.complete(new URLSearchParams({ state: url.searchParams.get('state'), code: 'synthetic-code' }), origin, () => true), false);
  assert.equal(env.requests.length, 0);
  await auth.snapshot(origin);
  url = new URL((await auth.begin(appKey, origin, 'session')).authorizationUrl);
  await auth.disconnect(origin);
  assert.equal(await auth.complete(new URLSearchParams({ state: url.searchParams.get('state'), code: 'synthetic-code' }), origin, () => true), false);
});

test('a rejected authorization code never marks the account connected or persists a token', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  const url = new URL((await auth.begin(appKey, origin, 'session')).authorizationUrl);
  env.tokenFailure('invalid_grant');
  const success = await auth.complete(new URLSearchParams({ state: url.searchParams.get('state'), code: 'synthetic-expired-code' }), origin, () => true);
  assert.equal(success, false);
  assert.equal((await auth.snapshot(origin)).status, 'error');
  assert.equal(env.stored().refreshToken, null);
  env.tokenFailure(null);
  await connect(auth);
  assert.equal((await auth.snapshot(origin)).status, 'connected');
});

test('disconnect revokes the authorization and cannot restore it after a restart', async t => {
  const env = fixture(), auth = env.make(); await connect(auth);
  assert.equal((await auth.disconnect(origin)).status, 'disconnected');
  assert.equal(env.requests.at(-1).url, 'https://api.dropboxapi.com/2/auth/token/revoke');
  assert.equal(env.stored().refreshToken, null);
  assert.equal(env.stored().appKey, appKey);
  auth.dispose(); const restarted = env.make(); t.after(() => restarted.dispose());
  assert.equal((await restarted.snapshot(origin)).status, 'disconnected');
});

test('pending revocation survives restart, blocks reconnection and retries safely', async t => {
  const env = fixture(), auth = env.make(); await connect(auth); env.revokeFailure(true);
  const state = await auth.disconnect(origin);
  assert.equal(state.status, 'error'); assert.equal(state.revocationPending, true);
  await assert.rejects(auth.begin('anotherTestKey', origin, 'session'));
  auth.dispose(); const restarted = env.make(); t.after(() => restarted.dispose());
  assert.equal((await restarted.snapshot(origin)).revocationPending, true);
  env.revokeFailure(false); await env.advance(60_000);
  assert.equal((await restarted.snapshot(origin)).status, 'disconnected');
  assert.equal(env.stored().refreshToken, null);
});

test('vault write failure after consent revokes the unpersisted grant', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  const url = new URL((await auth.begin(appKey, origin, 'session')).authorizationUrl);
  env.unavailable(true);
  assert.equal(await auth.complete(new URLSearchParams({ state: url.searchParams.get('state'), code: 'synthetic-code' }), origin, () => true), false);
  assert.equal(env.requests.at(-1).url.endsWith('/revoke'), true);
  assert.equal(env.stored().refreshToken, null);
  assert.equal((await auth.snapshot(origin)).status, 'unavailable');
});

test('unconfirmed revocation after vault failure remains visible and never reports connected', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  const url = new URL((await auth.begin(appKey, origin, 'session')).authorizationUrl);
  env.unavailable(true); env.revokeFailure(true);
  await auth.complete(new URLSearchParams({ state: url.searchParams.get('state'), code: 'synthetic-code' }), origin, () => true);
  assert.match((await auth.snapshot(origin)).message, /Remova o acesso/);
  env.unavailable(false);
  const recovered = await auth.snapshot(origin);
  assert.equal(recovered.status, 'error');
  assert.match(recovered.message, /Remova o acesso/);
  assert.equal(env.stored().refreshToken, null);
});

test('vault failure during unlink warns about unconfirmed revocation and does not resume locally', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  await connect(auth); env.unavailable(true);
  const failed = await auth.disconnect(origin);
  assert.equal(failed.status, 'unavailable');
  assert.match(failed.message, /Remova o acesso/);
  env.unavailable(false); env.revokeFailure(true);
  const recovered = await auth.snapshot(origin);
  assert.notEqual(recovered.status, 'connected');
  assert.equal(recovered.revocationPending, true);
  env.revokeFailure(false); await env.advance(60_000);
  assert.equal((await auth.snapshot(origin)).status, 'disconnected');
});

test('a duplicate connection request does not interrupt an existing authorization or renewal', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  const url = new URL((await auth.begin(appKey, origin, 'session')).authorizationUrl);
  await assert.rejects(auth.begin(appKey, origin, 'second-session'));
  assert.equal((await auth.snapshot(origin)).status, 'connecting');
  await auth.complete(new URLSearchParams({ state: url.searchParams.get('state'), code: 'synthetic-code' }), origin, () => true);
  await assert.rejects(auth.begin(appKey, origin, 'second-session'));
  assert.equal((await auth.snapshot(origin)).status, 'connected');
  await env.advance(3540_000);
  assert.equal(env.requests.length, 2);
});

test('disconnect renews an expired access token before revoking and invalid_client is not proof of revocation', async t => {
  const env = fixture(), auth = env.make(); t.after(() => auth.dispose());
  await connect(auth); env.tokenFailure('network');
  await env.advance(3600_000);
  env.tokenFailure('invalid_client');
  const pending = await auth.disconnect(origin);
  assert.equal(pending.revocationPending, true);
  assert.notEqual(env.stored().refreshToken, null, 'failed client authentication must not erase an unconfirmed revocation');
  env.tokenFailure(null);
  assert.equal((await auth.disconnect(origin)).status, 'disconnected');
  assert.equal(env.requests.at(-2).body.get('grant_type'), 'refresh_token');
  assert.equal(env.requests.at(-1).url.endsWith('/revoke'), true);
});

test('disconnect with an already invalid refresh grant clears unusable credentials', async t => {
  const env = fixture(), first = env.make(); await connect(first); first.dispose();
  env.tokenFailure('invalid_grant');
  const restarted = env.make(); t.after(() => restarted.dispose());
  assert.equal((await restarted.disconnect(origin)).status, 'disconnected');
  assert.equal(env.stored().refreshToken, null);
});

test('HTTP API enforces local host, origin, fetch metadata, JSON, cookie and CSRF', async t => {
  const env = fixture(), auth = env.make();
  const server = createServer();
  server.on('request', createDropboxMiddleware({ auth, port: () => server.address().port }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { auth.dispose(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = { Origin: base, 'Sec-Fetch-Site': 'same-origin', 'X-Open-Notes': 'dropbox', 'Content-Type': 'application/json' };
  const post = (path, extra = {}, body = '{}') => fetch(base + '/api/dropbox/' + path, { method: 'POST', headers: { ...headers, ...extra }, body });
  for (const path of ['download', 'upload', 'permissions']) {
    assert.equal((await post(path)).status, 403);
    assert.equal((await post(path, { Origin: 'https://untrusted.example' })).status, 403);
    assert.equal((await post(path, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  }
  for (const bad of [{ Origin: 'https://untrusted.example' }, { Origin: 'null' },
    { 'Sec-Fetch-Site': 'cross-site' }, { 'X-Open-Notes': '' }, { 'Content-Type': 'text/plain' }]) {
    assert.equal((await post('session', bad)).status, 403, JSON.stringify(bad));
  }
  const wrongHost = await new Promise((resolve, reject) => {
    const request = httpRequest(base + '/api/dropbox/session', { method: 'POST', headers: { ...headers, Host: 'evil.example' } }, response => {
      response.resume(); resolve(response.statusCode);
    });
    request.on('error', reject); request.end('{}');
  });
  assert.equal(wrongHost, 403);
  const preflight = await fetch(base + '/api/dropbox/session', { method: 'OPTIONS', headers: { Origin: 'https://untrusted.example' } });
  assert.equal(preflight.status, 403); assert.equal(preflight.headers.has('access-control-allow-origin'), false);
  assert.equal((await post('connect')).status, 403);
  const response = await post('session');
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie').split(';')[0];
  assert.match(response.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  const session = await response.json();
  for (const path of ['download', 'upload', 'permissions']) {
    assert.equal((await post(path, { Cookie: cookie })).status, 403);
    assert.equal((await post(path, { Cookie: cookie, 'X-CSRF-Token': 'wrong' })).status, 403);
  }
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await post('connect', { Cookie: cookie }, JSON.stringify({ appKey }))).status, 403);
  assert.equal((await post('connect', { Cookie: cookie, 'X-CSRF-Token': 'wrong' }, JSON.stringify({ appKey }))).status, 403);
  const result = await post('connect', { Cookie: cookie, 'X-CSRF-Token': session.csrf }, JSON.stringify({ appKey }));
  const url = new URL((await result.json()).authorizationUrl);
  const callback = await fetch(base + callbackPath + '?' + new URLSearchParams({ state: url.searchParams.get('state'), code: 'synthetic-code' }), { redirect: 'manual' });
  assert.equal(callback.status, 303);
  assert.equal(callback.headers.get('location'), '/api/dropbox/result?success=1');
  const restored = await post('session', { Cookie: cookie });
  assert.equal((await restored.json()).status, 'connected');
  const anotherBrowser = await post('session');
  assert.equal((await anotherBrowser.json()).status, 'connected');
  const checked = await post('permissions', { Cookie: cookie, 'X-CSRF-Token': session.csrf });
  assert.equal(checked.status, 200);
  const checkedBody = await checked.json();
  assert.equal(checkedBody.syncReady, true);
  assert.doesNotMatch(JSON.stringify(checkedBody), /synthetic-refresh|synthetic-renewed-access/);
  assert.equal((await post('disconnect', { Cookie: cookie, 'X-CSRF-Token': session.csrf })).status, 200);
  assert.equal(env.stored().refreshToken, null);
});
