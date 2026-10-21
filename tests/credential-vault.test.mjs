import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { createCredentialVault, VaultUnavailable } from '../local/credential-vault.mjs';

test('unsupported OS and unavailable native vault never fall back to disk/browser storage', async () => {
  let invoked = false;
  const unsupported = createCredentialVault({ platform: 'linux', run: async () => { invoked = true; } });
  await assert.rejects(unsupported.probe(), VaultUnavailable); assert.equal(invoked, false);
  const broken = createCredentialVault({ platform: 'win32', run: async () => { throw new Error('private native detail'); } });
  await assert.rejects(broken.write({ appKey: 'synthetic' }), error => error instanceof VaultUnavailable && !error.message.includes('private'));
});

test('Windows credential manager round-trip with an isolated synthetic credential', { skip: process.platform !== 'win32' }, async t => {
  const vault = createCredentialVault({ target: 'OpenNotes.Dropbox.Test.' + randomUUID() });
  t.after(() => vault.clear());
  await vault.probe(); assert.equal(await vault.read(), null);
  const fixture = { appKey: 'syntheticTestApp', refreshToken: 'synthetic-refresh-not-a-real-token' };
  await vault.write(fixture); assert.deepEqual(await vault.read(), fixture);
  await vault.clear(); assert.equal(await vault.read(), null);
});
