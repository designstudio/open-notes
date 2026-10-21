import { createHash, randomBytes } from 'node:crypto';
import { VaultUnavailable } from './credential-vault.mjs';

const tokenURL = 'https://api.dropboxapi.com/oauth2/token';
const revokeURL = 'https://api.dropboxapi.com/2/auth/token/revoke';
export const callbackPath = '/api/dropbox/callback';
const random = () => randomBytes(32).toString('base64url');
const validKey = value => typeof value === 'string' && /^[a-zA-Z0-9]{5,100}$/.test(value);
const renewalMargin = 60_000;
export const syncScopes = ['files.metadata.read', 'files.content.read', 'files.content.write'];

class OAuthFailure extends Error {
  constructor(reason = null) {
    const permanent = reason === 'invalid_grant' || reason === 'invalid_client';
    super(permanent ? 'A autorização do Dropbox não é mais válida. Conecte novamente.'
      : 'Não foi possível falar com o Dropbox. Verifique a conexão e tente novamente.');
    this.permanent = permanent;
    this.invalidGrant = reason === 'invalid_grant';
  }
}
class ControlFailure extends Error {}

/** Tokens stay here; trusted local adapters receive them only inside serialized operations. */
export function createDropboxAuth({ vault, fetch: request = globalThis.fetch, now = Date.now,
  schedule = setTimeout, cancel = clearTimeout } = {}) {
  let record = null, loaded = false, access = null, pending = null, timer = null;
  let status = 'disconnected', message = null, retryAt = 0, queue = Promise.resolve();
  let manualWarning = null;
  const serial = task => {
    const result = queue.then(task);
    queue = result.catch(() => {});
    return result;
  };
  function stopTimer() { if (timer !== null) cancel(timer); timer = null; }
  function fail(error) {
    status = error instanceof VaultUnavailable ? 'unavailable' : 'error';
    message = error instanceof VaultUnavailable || error instanceof OAuthFailure ? error.message
      : 'Não foi possível concluir a conexão com o Dropbox. Tente novamente.';
    stopTimer();
    retryAt = now() + 60_000;
    if (record?.refreshToken && !record.needsReconnect && !(error instanceof VaultUnavailable)) {
      timer = schedule(() => {
        timer = null;
        void serial(async () => {
          try {
            if (record?.revokePending) await revoke();
            else if (record?.refreshToken && !record.needsReconnect) { await refresh(); status = 'connected'; message = null; }
          } catch (reason) { await handleRefreshFailure(reason); }
        });
      }, 60_000);
      timer?.unref?.();
    }
  }
  async function token(parameters) {
    let response, payload;
    try {
      response = await request(tokenURL, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(parameters), signal: AbortSignal.timeout(15000), redirect: 'error',
      });
      payload = await response.json();
    } catch { throw new OAuthFailure(); }
    if (!response.ok) throw new OAuthFailure(payload?.error);
    if (typeof payload.access_token !== 'string' || !payload.access_token ||
      !Number.isFinite(payload.expires_in) || payload.expires_in <= 0) throw new OAuthFailure();
    return payload;
  }
  function rememberAccess(payload) {
    access = { token: payload.access_token, expiresAt: now() + payload.expires_in * 1000 };
    stopTimer();
    timer = schedule(() => {
      timer = null;
      void serial(async () => {
        if (!record?.refreshToken || record.revokePending || record.needsReconnect) return;
        try { await refresh(); status = 'connected'; message = null; }
        catch (error) { await handleRefreshFailure(error); }
      });
    }, Math.max(1000, access.expiresAt - now() - renewalMargin));
    timer?.unref?.();
  }
  async function refresh() {
    const payload = await token({ grant_type: 'refresh_token', refresh_token: record.refreshToken, client_id: record.appKey });
    // Older vault entries did not record scopes. Only Dropbox's token response
    // can confirm them; an App Console checkbox is not proof of an existing grant.
    if (typeof payload.scope === 'string') {
      const confirmed = { ...record, scopes: [...new Set(payload.scope.trim().split(/\s+/).filter(Boolean))],
        connectionId: record.connectionId || random() };
      if (JSON.stringify(confirmed.scopes) !== JSON.stringify(record.scopes) || !record.connectionId) await vault.write(confirmed);
      record = confirmed;
    }
    rememberAccess(payload);
  }
  async function handleRefreshFailure(error) {
    access = null;
    if (error instanceof OAuthFailure && error.permanent) {
      record = { ...record, needsReconnect: true };
      try { await vault.write(record); } catch (vaultError) { fail(vaultError); return; }
    }
    fail(error);
  }
  async function load() {
    if (loaded) return;
    await vault.probe();
    const saved = await vault.read();
    if (saved !== null && (!saved || !validKey(saved.appKey) ||
      (saved.refreshToken !== null && typeof saved.refreshToken !== 'string') ||
      typeof saved.revokePending !== 'boolean' || typeof saved.needsReconnect !== 'boolean')) throw new VaultUnavailable();
    // If the vault recovered after a failed unlink checkpoint, retain the local
    // revocation intent rather than restoring the old active credential.
    const retainRevocation = record?.revokePending && record.refreshToken === saved?.refreshToken && record.appKey === saved?.appKey;
    record = saved;
    if (retainRevocation && record) record.revokePending = true;
    loaded = true;
    if (status === 'unavailable') { status = 'disconnected'; message = null; retryAt = 0; }
  }
  async function revoke() {
    status = 'disconnecting';
    stopTimer();
    pending = null;
    // Checkpoint the intent before the remote call: a restart must not reconnect.
    if (!record?.refreshToken) { access = null; status = 'disconnected'; message = null; return; }
    record = { ...record, revokePending: true };
    try { await vault.write(record); }
    catch (error) {
      manualWarning = 'Não foi possível registrar a revogação no cofre. Remova o acesso do Open Notes nas integrações da sua conta Dropbox; a revogação remota ainda não foi confirmada.';
      throw error;
    }
    try {
      if (!access || access.expiresAt <= now()) await refresh();
      stopTimer();
      let response;
      try {
        response = await request(revokeURL, { method: 'POST',
          headers: { Authorization: `Bearer ${access.token}` }, signal: AbortSignal.timeout(15000), redirect: 'error' });
      } catch { throw new OAuthFailure(); }
      if (!response.ok) throw new OAuthFailure();
    } catch (error) {
      // invalid_grant during refresh means this authorization is already unusable.
      if (!(error instanceof OAuthFailure && error.invalidGrant)) throw error;
    } finally { access = null; stopTimer(); }
    const cleared = { appKey: record.appKey, refreshToken: null, revokePending: false, needsReconnect: false };
    await vault.write(cleared);
    record = cleared;
    manualWarning = null;
    status = 'disconnected'; message = null;
  }
  function view(origin) {
    return { status: status === 'unavailable' ? status : manualWarning ? 'error' : status,
      message: manualWarning || message, appKey: record?.appKey || '', linked: Boolean(record?.refreshToken),
      revocationPending: Boolean(record?.revokePending), callbackUri: origin + callbackPath,
      expiresAt: access?.expiresAt || null,
      syncReady: syncScopes.every(scope => record?.scopes?.includes(scope)), connectionId: record?.connectionId || '' };
  }
  return {
    snapshot: origin => serial(async () => {
      try {
        if (status === 'unavailable') loaded = false;
        await load();
        if (pending && pending.expiresAt <= now()) {
          pending = null; status = 'error'; message = 'A autorização expirou. Tente conectar novamente.';
        }
        if (record?.revokePending && now() >= retryAt) await revoke();
        else if (record?.refreshToken && !record.revokePending && !record.needsReconnect && !pending &&
          (!access || access.expiresAt <= now() + renewalMargin) && now() >= retryAt) {
          try { await refresh(); status = 'connected'; message = null; }
          catch (error) { await handleRefreshFailure(error); }
        } else if (record?.needsReconnect && status !== 'unavailable' && !pending) {
          status = 'error'; message = 'A autorização do Dropbox não é mais válida. Conecte novamente.';
        }
      } catch (error) { fail(error); }
      return view(origin);
    }),
    verifyPermissions: origin => serial(async () => {
      try {
        if (status === 'unavailable') loaded = false;
        await load();
        if (!record?.refreshToken || record.revokePending || record.needsReconnect || pending || manualWarning) return view(origin);
        // Explicit verification renews even a live token. No file API is used.
        try { await refresh(); status = 'connected'; message = null; retryAt = 0; }
        catch (error) { await handleRefreshFailure(error); }
      } catch (error) { fail(error); }
      return view(origin);
    }),
    begin: (appKey, origin, sessionId) => serial(async () => {
      try {
        await load();
        if (!validKey(appKey)) throw new ControlFailure('Informe uma Dropbox App Key válida.');
        if (pending || (record?.refreshToken && !record.needsReconnect)) throw new ControlFailure('Já existe uma conexão ou autorização em andamento.');
        if (record?.revokePending) throw new ControlFailure('Conclua a revogação pendente antes de conectar novamente.');
        // Persist the personal configuration only in the OS vault.
        record = { appKey, refreshToken: null, revokePending: false, needsReconnect: false };
        await vault.write(record);
        manualWarning = null;
        const verifier = random(), state = random();
        pending = { verifier, state, sessionId, origin, expiresAt: now() + 300_000 };
        const url = new URL('https://www.dropbox.com/oauth2/authorize');
        url.search = new URLSearchParams({ client_id: appKey, response_type: 'code', token_access_type: 'offline',
          code_challenge_method: 'S256', code_challenge: createHash('sha256').update(verifier).digest('base64url'),
          state, redirect_uri: origin + callbackPath,
          scope: syncScopes.join(' ') }).toString();
        status = 'connecting'; message = null; retryAt = 0;
        return { authorizationUrl: url.href };
      } catch (error) {
        if (error instanceof ControlFailure) throw error;
        fail(error); throw new Error(message);
      }
    }),
    complete: (parameters, origin, sessionAlive) => serial(async () => {
      const attempt = pending;
      if (!attempt || attempt.origin !== origin || attempt.expiresAt <= now() ||
        parameters.getAll('state').length !== 1 || parameters.get('state') !== attempt.state || !sessionAlive(attempt.sessionId)) {
        return false;
      }
      pending = null; // Consume state before any network request; callbacks cannot be replayed.
      try {
        if (parameters.has('error')) {
          status = 'error'; message = 'A autorização do Dropbox foi cancelada. Tente conectar novamente.'; return false;
        }
        const code = parameters.get('code');
        if (!code || parameters.getAll('code').length !== 1 || code.length > 4096) throw new OAuthFailure();
        const payload = await token({ grant_type: 'authorization_code', code, code_verifier: attempt.verifier,
          client_id: record.appKey, redirect_uri: origin + callbackPath });
        if (typeof payload.refresh_token !== 'string' || !payload.refresh_token) throw new OAuthFailure();
        const connected = { ...record, refreshToken: payload.refresh_token, scopes: typeof payload.scope === 'string' ? payload.scope.trim().split(/\s+/).filter(Boolean) : [], connectionId: random() };
        try { await vault.write(connected); }
        catch (error) {
          // A grant that could not be persisted must not be reported as connected.
          let revoked = false;
          try { revoked = (await request(revokeURL, { method: 'POST', headers: { Authorization: `Bearer ${payload.access_token}` },
            signal: AbortSignal.timeout(15000), redirect: 'error' })).ok; } catch { /* No credential fallback. */ }
          if (!revoked) {
            fail(error);
            manualWarning = 'O cofre falhou e a revogação não foi confirmada. Remova o acesso do Open Notes nas integrações da sua conta Dropbox antes de tentar novamente.';
            return false;
          }
          throw error;
        }
        record = connected; rememberAccess(payload); status = 'connected'; message = null;
        return true;
      } catch (error) { fail(error); return false; }
    }),
    disconnect: origin => serial(async () => {
      try { await load(); await revoke(); }
      catch (error) { fail(error); }
      return view(origin);
    }),
    authorized: operation => serial(async () => {
      if (status === 'unavailable') loaded = false;
      await load();
      if (!record?.refreshToken || record.revokePending || record.needsReconnect || pending || manualWarning) throw new Error('Vincule novamente a conta Dropbox antes de sincronizar.');
      if (!syncScopes.every(scope => record.scopes?.includes(scope))) throw new Error('Este vínculo permite apenas metadados. Habilite files.content.read e files.content.write na App Console, desvincule e conecte novamente.');
      if (!access || access.expiresAt <= now() + renewalMargin) {
        try { await refresh(); status = 'connected'; message = null; }
        catch (error) { await handleRefreshFailure(error); throw new Error(message); }
      }
      try { return await operation(access.token); }
      catch (error) {
        if (error?.kind !== 'authorization') throw error;
        access = null;
        try { await refresh(); status = 'connected'; message = null; }
        catch (reason) { await handleRefreshFailure(reason); throw new Error(message); }
        return operation(access.token);
      }
    }),
    dispose() { stopTimer(); pending = null; access = null; },
  };
}
