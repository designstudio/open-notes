import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDropboxAuth } from '../local/dropbox-auth.mjs';
import { createDropboxFiles, snapshotPath, maxSnapshotBytes } from '../local/dropbox-files.mjs';

function fixture(t, scopes = ['files.metadata.read', 'files.content.read', 'files.content.write']) {
  let stored = { appKey: 'personalTestKey', refreshToken: 'synthetic-refresh', revokePending: false, needsReconnect: false, scopes };
  let remote = null, revision = 0, failure = null;
  const calls = [];
  const vault = { async probe() {}, async read() { return structuredClone(stored); }, async write(value) { stored = structuredClone(value); } };
  const auth = createDropboxAuth({ vault, fetch: async url => {
    if (url.endsWith('/revoke')) return new Response('');
    return Response.json({ access_token: 'synthetic-access', expires_in: 3600 });
  } }); t.after(() => auth.dispose());
  const files = createDropboxFiles({ auth, fetch: async (url, init) => {
    calls.push({ url, init });
    assert.equal(init.headers.Authorization, 'Bearer synthetic-access');
    const args = JSON.parse(init.headers['Dropbox-API-Arg']); assert.equal(args.path, snapshotPath);
    assert.equal(init.redirect, 'error');
    if (failure) return Response.json(failure.body, { status: failure.status });
    if (url.endsWith('/download')) return remote ? new Response(JSON.stringify(remote), { headers: { 'Dropbox-API-Result': JSON.stringify({ rev: String(revision) }) } })
      : Response.json({ error: { '.tag': 'path', path: { '.tag': 'not_found' } } }, { status: 409 });
    assert.equal(args.autorename, false); assert.equal(args.strict_conflict, true);
    if ((remote && (args.mode['.tag'] !== 'update' || args.mode.update !== String(revision))) || (!remote && args.mode['.tag'] !== 'add')) return Response.json({ error: { '.tag': 'path', path: { reason: { '.tag': 'conflict' } } } }, { status: 409 });
    remote = JSON.parse(init.body); revision++; return Response.json({ rev: String(revision) });
  } });
  return { files, auth, calls, failure: value => { failure = value; }, remote: () => remote };
}
const snapshot = { schemaVersion: 1, updatedAt: 100, data: { notes: [], collections: [], folders: [] } };
test('Dropbox adapter creates exactly one fixed App Folder snapshot and updates by revision only', async t => {
  const env = fixture(t); assert.equal(await env.files.download(), null);
  assert.deepEqual(await env.files.upload(snapshot, null), { revision: '1' });
  assert.deepEqual(await env.files.download(), { revision: '1', snapshot });
  await env.files.upload({ ...snapshot, updatedAt: 200 }, '1');
  await assert.rejects(env.files.upload(snapshot, '1'), error => error.kind === 'conflict');
  await assert.rejects(env.files.upload(snapshot, null), error => error.kind === 'conflict');
  assert.equal(env.remote().updatedAt, 200);
  assert.doesNotMatch(JSON.stringify(await env.auth.snapshot('http://localhost:5173')), /synthetic-access|synthetic-refresh/);
});
test('Dropbox adapter blocks old metadata-only grants and invalid paths/revisions before sending content', async t => {
  const env = fixture(t, ['files.metadata.read']);
  assert.equal((await env.auth.snapshot('http://localhost:5173')).syncReady, false);
  await assert.rejects(env.files.download(), /metadados/);
  assert.equal(env.calls.length, 0);
  await assert.rejects(async () => env.files.upload(snapshot, '../../arbitrary'), /inválido/);
  await assert.rejects(async () => env.files.upload({ ...snapshot, schemaVersion: 9 }, null), /inválido/);
});
for (const [status, kind] of [[403, 'permission'], [429, 'quota'], [503, 'network']]) test(`Dropbox HTTP ${status} preserves notes and returns a safe ${kind} error`, async t => {
  const env = fixture(t); env.failure({ status, body: { error_summary: 'private service detail' } });
  await assert.rejects(env.files.download(), error => error.kind === kind && !error.message.includes('private'));
  assert.equal(env.remote(), null);
});
test('Dropbox upload bounds snapshot size before any remote operation', async t => {
  const env = fixture(t);
  await assert.rejects(async () => env.files.upload({ ...snapshot, data: { ...snapshot.data, padding: 'x'.repeat(maxSnapshotBytes) } }, null), error => error.kind === 'size');
  assert.equal(env.calls.length, 0);
});
test('Dropbox revocation blocks further file operations without deleting the remote snapshot', async t => {
  const env = fixture(t); await env.files.upload(snapshot, null); await env.auth.disconnect('http://localhost:5173');
  await assert.rejects(env.files.download(), /Vincule novamente/); assert.deepEqual(env.remote(), snapshot);
});
