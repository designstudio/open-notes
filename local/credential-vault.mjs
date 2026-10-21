import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export class VaultUnavailable extends Error {
  constructor() { super('O cofre de credenciais do Windows não está disponível. Nenhum token será salvo no navegador.'); }
}

function invoke(input) {
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-File', fileURLToPath(new URL('./windows-credential-vault.ps1', import.meta.url))],
    { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '';
    const timer = setTimeout(() => { child.kill(); reject(new VaultUnavailable()); }, 15000);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      output += chunk;
      if (output.length > 65536) { child.kill(); reject(new VaultUnavailable()); }
    });
    child.stderr.resume();
    child.stdin.on('error', () => {});
    child.on('error', () => { clearTimeout(timer); reject(new VaultUnavailable()); });
    child.on('close', code => {
      clearTimeout(timer);
      try {
        if (code !== 0) throw new VaultUnavailable();
        resolve(JSON.parse(output).value);
      } catch { reject(new VaultUnavailable()); }
    });
    // Secrets travel through a private pipe, never command arguments or shell interpolation.
    child.stdin.end(JSON.stringify(input));
  });
}

export function createCredentialVault({ platform = process.platform, target = 'OpenNotes.Dropbox.Auth.v1', run = invoke } = {}) {
  async function call(operation, value) {
    if (platform !== 'win32') throw new VaultUnavailable();
    try { return await run({ operation, target, value }); } catch { throw new VaultUnavailable(); }
  }
  return {
    probe: () => call('probe'),
    async read() {
      const value = await call('read');
      if (value === null) return null;
      try { return JSON.parse(value); } catch { throw new VaultUnavailable(); }
    },
    write: value => call('write', JSON.stringify(value)),
    clear: () => call('delete'),
  };
}
