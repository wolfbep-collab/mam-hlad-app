import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  demoStreetFoodVendors,
  getDemoStreetFoodCheckIns,
} from '../data/demoStreetFood';
import type {
  ActiveStreetFoodVendor,
  DietaryPreference,
  StreetFoodCheckIn,
  StreetFoodMenuItem,
  StreetFoodVendor,
} from '../types';
import { calculateDistanceMeters, type UserLocation } from './location';

const LOCAL_CHECKINS_KEY = 'mam-hlad:street-food-checkins:v1';
const MAX_LOCAL_CHECKINS = 50;

export async function loadLocalCheckIns(): Promise<StreetFoodCheckIn[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_CHECKINS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StreetFoodCheckIn[];
  } catch {
    return [];
  }
}

async function writeLocalCheckIns(items: StreetFoodCheckIn[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_CHECKINS_KEY, JSON.stringify(items));
  } catch {
    // best-effort persistence; ignore failures in MVP
  }
}

export async function saveLocalCheckIn(
  checkIn: StreetFoodCheckIn
): Promise<void> {
  const current = await loadLocalCheckIns();
  const filtered = current.filter((c) => c.vendorId !== checkIn.vendorId);
  const next = [checkIn, ...filtered].slice(0, MAX_LOCAL_CHECKINS);
  await writeLocalCheckIns(next);
}

export async function endLocalCheckIn(
  vendorId: string,
  now: Date = new Date()
): Promise<void> {
  const current = await loadLocalCheckIns();
  const next = current.map((c) =>
    c.vendorId === vendorId
      ? { ...c, status: 'inactive' as const, activeUntil: now.getTime() }
      : c
  );
  await writeLocalCheckIns(next);
}

export async function clearLocalCheckIns(): Promise<void> {
  await writeLocalCheckIns([]);
}

export function isCheckInActive(
  checkIn: StreetFoodCheckIn,
  now: Date
): boolean {
  if (checkIn.status !== 'active') return false;
  const t = now.getTime();
  return t >= checkIn.activeFrom && t < checkIn.activeUntil;
}

export function mergeDemoAndLocalCheckIns(
  demo: StreetFoodCheckIn[],
  local: StreetFoodCheckIn[]
): StreetFoodCheckIn[] {
  const localVendorIds = new Set(local.map((c) => c.vendorId));
  const filteredDemo = demo.filter((c) => !localVendorIds.has(c.vendorId));
  return [...local, ...filteredDemo];
}

export function vendorMatchesDiet(
  vendor: StreetFoodVendor,
  diet: DietaryPreference
): boolean {
  if (diet === 'any') return true;
  if (diet === 'vegan') return vendor.menuItems.some((i) => i.isVegan);
  return vendor.menuItems.some((i) => i.isVegetarian || i.isVegan);
}

export function filterVendorMenuByDiet(
  vendor: StreetFoodVendor,
  diet: DietaryPreference
): StreetFoodMenuItem[] {
  if (diet === 'any') return vendor.menuItems;
  if (diet === 'vegan') return vendor.menuItems.filter((i) => i.isVegan);
  return vendor.menuItems.filter((i) => i.isVegetarian || i.isVegan);
}

export function filterStreetFoodByDiet(
  items: ActiveStreetFoodVendor[],
  diet: DietaryPreference
): ActiveStreetFoodVendor[] {
  if (diet === 'any') return items;
  return items.filter((i) => vendorMatchesDiet(i.vendor, diet));
}

export function sortStreetFoodByDistance(
  items: ActiveStreetFoodVendor[]
): ActiveStreetFoodVendor[] {
  return [...items].sort((a, b) => {
    const da = a.distanceMeters;
    const db = b.distanceMeters;
    if (da == null && db == null) return 0;
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });
}

export interface ActiveStreetFoodInput {
  now: Date;
  userLocation: UserLocation | null;
  localCheckIns: StreetFoodCheckIn[];
  diet?: DietaryPreference;
}

export function getActiveStreetFoodVendors(
  input: ActiveStreetFoodInput
): ActiveStreetFoodVendor[] {
  const { now, userLocation, localCheckIns, diet = 'any' } = input;
  const demo = getDemoStreetFoodCheckIns(now, userLocation);
  const merged = mergeDemoAndLocalCheckIns(demo, localCheckIns);
  const active = merged.filter((c) => isCheckInActive(c, now));

  const vendorById = new Map<string, StreetFoodVendor>(
    demoStreetFoodVendors.map((v) => [v.id, v])
  );

  const enriched: ActiveStreetFoodVendor[] = [];
  for (const c of active) {
    const vendor = vendorById.get(c.vendorId);
    if (!vendor) continue;
    if (!vendorMatchesDiet(vendor, diet)) continue;
    const distance = userLocation
      ? calculateDistanceMeters(userLocation, {
          latitude: c.latitude,
          longitude: c.longitude,
        })
      : null;
    enriched.push({ vendor, checkIn: c, distanceMeters: distance });
  }

  return sortStreetFoodByDistance(enriched);
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatCheckInTime(
  checkIn: StreetFoodCheckIn,
  now: Date
): string {
  const remaining = checkIn.activeUntil - now.getTime();
  if (remaining <= 0) return 'Skončeno';
  const close = new Date(checkIn.activeUntil);
  return `Otevřeno do ${pad2(close.getHours())}:${pad2(close.getMinutes())}`;
}

export function formatRemainingHours(
  checkIn: StreetFoodCheckIn,
  now: Date
): string | null {
  const remainingMs = checkIn.activeUntil - now.getTime();
  if (remainingMs <= 0) return null;
  const hours = remainingMs / (60 * 60 * 1000);
  if (hours < 1) {
    const minutes = Math.max(1, Math.round(remainingMs / 60000));
    return `~${minutes} min`;
  }
  return `~${Math.round(hours)} h`;
}

export const streetFoodCategoryEmoji: Record<
  StreetFoodVendor['category'],
  string
> = {
  coffee: '☕',
  sandwich: '🥪',
  burger: '🍔',
  vegan_bowl: '🥗',
  tacos: '🌮',
  soup: '🍲',
  sweet: '🥞',
  asian_noodles: '🍜',
  other: '🍽️',
};
