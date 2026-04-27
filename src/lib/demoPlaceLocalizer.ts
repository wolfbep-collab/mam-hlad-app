import type { Place } from '../types';
import { calculateDistanceMeters, type UserLocation } from './location';

const DEFAULT_THRESHOLD_METERS = 20_000;

const DISTANCE_BUCKETS: Array<{ min: number; max: number }> = [
  { min: 200, max: 500 },
  { min: 700, max: 1_500 },
  { min: 2_000, max: 4_000 },
];

const METERS_PER_DEGREE_LAT = 111_320;

function hashId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h * 33) ^ id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function offsetForId(
  id: string,
  userLatitude: number
): { dLat: number; dLon: number } {
  const h = hashId(id);
  const bucket = DISTANCE_BUCKETS[h % DISTANCE_BUCKETS.length];
  const span = bucket.max - bucket.min;
  const distFraction = ((h >> 5) & 0x3ff) / 0x3ff;
  const distanceMeters = bucket.min + distFraction * span;
  const bearingDeg = (h >> 11) % 360;
  const bearingRad = (bearingDeg * Math.PI) / 180;

  const dNorthMeters = distanceMeters * Math.cos(bearingRad);
  const dEastMeters = distanceMeters * Math.sin(bearingRad);

  const latRad = (userLatitude * Math.PI) / 180;
  const cosLat = Math.cos(latRad);
  const safeCosLat = Math.abs(cosLat) < 1e-6 ? 1e-6 : cosLat;

  const dLat = dNorthMeters / METERS_PER_DEGREE_LAT;
  const dLon = dEastMeters / (METERS_PER_DEGREE_LAT * safeCosLat);

  return { dLat, dLon };
}

export function isDatasetTooFar(
  user: UserLocation,
  places: Place[],
  thresholdMeters: number = DEFAULT_THRESHOLD_METERS
): boolean {
  let nearest = Number.POSITIVE_INFINITY;
  for (const place of places) {
    const d = calculateDistanceMeters(user, place);
    if (d == null) continue;
    if (d < nearest) nearest = d;
  }
  if (!Number.isFinite(nearest)) return false;
  return nearest > thresholdMeters;
}

export function createLocalizedDemoPlaces(
  user: UserLocation,
  places: Place[]
): Place[] {
  return places.map((place) => {
    const { dLat, dLon } = offsetForId(place.id, user.latitude);
    return {
      ...place,
      latitude: user.latitude + dLat,
      longitude: user.longitude + dLon,
    };
  });
}

export interface LocalizedDemoPlacesResult {
  places: Place[];
  localized: boolean;
}

export function maybeLocalizeDemoPlaces(
  user: UserLocation | null,
  places: Place[],
  thresholdMeters: number = DEFAULT_THRESHOLD_METERS
): LocalizedDemoPlacesResult {
  if (!user) return { places, localized: false };
  if (!isDatasetTooFar(user, places, thresholdMeters)) {
    return { places, localized: false };
  }
  return { places: createLocalizedDemoPlaces(user, places), localized: true };
}
