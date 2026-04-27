import type { HistoryEntry } from '../types';

export const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface RecentHistorySignals {
  recentPlaceIds: string[];
  recentMenuItemNames: string[];
  hasRecent: boolean;
}

export function getRecentHistorySignals(
  history: HistoryEntry[] | null | undefined,
  now: number = Date.now(),
  windowMs: number = RECENT_WINDOW_MS
): RecentHistorySignals {
  const placeIds = new Set<string>();
  const menuItemNames = new Set<string>();

  if (!Array.isArray(history)) {
    return {
      recentPlaceIds: [],
      recentMenuItemNames: [],
      hasRecent: false,
    };
  }

  const cutoff = now - windowMs;
  for (const entry of history) {
    if (!entry || typeof entry.timestamp !== 'number') continue;
    if (entry.timestamp < cutoff) continue;
    if (typeof entry.placeId === 'string' && entry.placeId.length > 0) {
      placeIds.add(entry.placeId);
    }
    if (
      typeof entry.menuItemName === 'string' &&
      entry.menuItemName.length > 0
    ) {
      menuItemNames.add(entry.menuItemName);
    }
  }

  return {
    recentPlaceIds: Array.from(placeIds),
    recentMenuItemNames: Array.from(menuItemNames),
    hasRecent: placeIds.size > 0 || menuItemNames.size > 0,
  };
}
