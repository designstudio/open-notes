import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const applicationPaths = ['src/', 'package.json', 'package-lock.json', 'vite.config.ts', 'index.html'];

async function hashWorktreeFiles(root, paths, identity) {
  // Include new sources before staging, and read their working-tree contents.
  // NUL separators preserve filenames containing spaces, Unicode or newlines.
  const listing = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', ...paths], {
    cwd: root, encoding: 'utf8',
  });
  const files = [...new Set(listing.split('\0').filter(Boolean))].sort();
  const hash = createHash('sha256').update(`open-notes:fingerprint:2:${identity}\0`);
  for (const file of files) {
    let contents;
    try {
      contents = await readFile(resolve(root, file));
    } catch (error) {
      // A deleted file may still be in the index until its deletion is staged.
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') continue;
      throw error;
    }
    hash.update(file).update('\0').update(String(contents.length)).update('\0').update(contents);
  }
  return hash.digest('hex');
}

export async function benchmarkFingerprints(root = process.cwd()) {
  const [codeSha256, runnerSha256] = await Promise.all([
    hashWorktreeFiles(root, applicationPaths, 'application'),
    // The runner identity also covers its fixtures, browser harness and helper.
    hashWorktreeFiles(root, ['benchmarks/'], 'runner'),
  ]);
  return { fingerprintVersion: 2, codeSha256, runnerSha256 };
}
