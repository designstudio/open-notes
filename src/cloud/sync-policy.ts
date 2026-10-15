import { initialCollections, initialFolders, initialNotes, type AppData } from '../data';
import { readProfile } from '../profile';

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  return JSON.stringify(value);
}

export function dataFingerprint(data: AppData) {
  const profile = readProfile(data.profile);
  // Old snapshots have no profile. An empty profile is the same workspace.
  return canonical({ ...data, profile: profile.name || profile.photo ? profile : undefined });
}

export function isExampleSpace(data: AppData) {
  // Example dates are generated on each load; every other field must be intact.
  const withoutDates = ({ profile: _profile, ...space }: AppData) => ({ ...space, notes: space.notes.map(({ updated: _updated, ...note }) => note) });
  return canonical(withoutDates(data)) === canonical(withoutDates({
    notes: initialNotes, collections: initialCollections, folders: initialFolders,
  }));
}

export function connectionDecision(local: AppData, remote: AppData): 'remote' | 'same' | 'conflict' {
  if (dataFingerprint(local) === dataFingerprint(remote)) return 'same';
  const localProfile = readProfile(local.profile);
  const profileCanImport = (!localProfile.name && !localProfile.photo)
    || canonical(localProfile) === canonical(readProfile(remote.profile));
  if (profileCanImport && (isExampleSpace(local) || (!local.notes.length && !local.collections.length && !local.folders.length))) return 'remote';
  return 'conflict';
}

