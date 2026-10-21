export const syncIntervalOptions = [1, 3, 6, 12, 24] as const;
export type SyncIntervalHours = typeof syncIntervalOptions[number];
export const syncIntervalKey = 'open-notes-dropbox-sync-interval-hours';
export const syncAttemptKey = (connection: string) => `open-notes-dropbox-sync-attempt-${connection}`;
export const hoursToMs = (hours: SyncIntervalHours) => hours * 60 * 60 * 1000;
export function isSyncIntervalHours(value: number): value is SyncIntervalHours {
  return syncIntervalOptions.some(hours => hours === value);
}
export function readSyncInterval(): SyncIntervalHours {
  try {
    const hours = Number(localStorage.getItem(syncIntervalKey));
    return isSyncIntervalHours(hours) ? hours : 1;
  } catch { return 1; }
}
export function readSyncAttempt(connection: string): number {
  try {
    const time = Number(localStorage.getItem(syncAttemptKey(connection)));
    return validAnchor(time);
  } catch { return 0; }
}
function validAnchor(value: number | undefined): number {
  // Ignore corrupt dates and large clock jumps instead of overflowing timers.
  return value !== undefined && Number.isSafeInteger(value) && value > 0 && value <= Date.now() + hoursToMs(24) ? value : 0;
}
export function nextScheduledSync(connection: string, lastSyncedAt: number | undefined): number {
  const anchor = Math.max(validAnchor(lastSyncedAt), readSyncAttempt(connection));
  return anchor ? anchor + hoursToMs(readSyncInterval()) : Date.now();
}
