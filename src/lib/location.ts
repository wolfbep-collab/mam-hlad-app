import * as Location from 'expo-location';
import type { Place } from '../types';

export type LocationStatus =
  | 'not_requested'
  | 'loading'
  | 'granted'
  | 'denied'
  | 'unavailable';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export async function getCurrentLocation(): Promise<{
  location: UserLocation | null;
  status: LocationStatus;
}> {
  try {
    const services = await Location.hasServicesEnabledAsync();
    if (!services) {
      return { location: null, status: 'unavailable' };
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { location: null, status: 'denied' };
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      location: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
      status: 'granted',
    };
  } catch {
    return { location: null, status: 'unavailable' };
  }
}

const EARTH_RADIUS_M = 6_371_000;

export function calculateDistanceMeters(
  user: UserLocation,
  place: Pick<Place, 'latitude' | 'longitude'>
): number | null {
  if (place.latitude == null || place.longitude == null) return null;
  const phi1 = (user.latitude * Math.PI) / 180;
  const phi2 = (place.latitude * Math.PI) / 180;
  const dPhi = ((place.latitude - user.latitude) * Math.PI) / 180;
  const dLambda = ((place.longitude - user.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1).replace('.', ',')} km`;
}

let cachedLocation: UserLocation | null = null;
let cachedStatus: LocationStatus = 'not_requested';

export function setCachedLocation(
  loc: UserLocation | null,
  status: LocationStatus
) {
  cachedLocation = loc;
  cachedStatus = status;
}

export function getCachedLocation(): UserLocation | null {
  return cachedLocation;
}

export function getCachedStatus(): LocationStatus {
  return cachedStatus;
}
