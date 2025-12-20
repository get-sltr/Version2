// =============================================================================
// Geographic Utilities
// =============================================================================

import type { Coordinates } from '@/types/map';

const EARTH_RADIUS_MILES = 3958.8;
const FEET_PER_MILE = 5280;

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in miles
 */
export function haversineMiles(origin: Coordinates, destination: Coordinates): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lng - origin.lng);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
}

/**
 * Convert miles to feet
 */
export function milesToFeet(miles: number): number {
  return miles * FEET_PER_MILE;
}

/**
 * Convert feet to miles
 */
export function feetToMiles(feet: number): number {
  return feet / FEET_PER_MILE;
}

/**
 * Format distance for display
 * @param feet Distance in feet
 * @returns Formatted string like "0.5 mi" or "500 ft"
 */
export function formatDistance(feet: number | null): string {
  if (feet === null || !Number.isFinite(feet)) return '—';

  const miles = feetToMiles(feet);

  if (miles < 0.1) {
    return `${Math.round(feet)} ft`;
  }

  return `${miles.toFixed(1)} mi`;
}

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(lat: unknown, lng: unknown): boolean {
  const latNum = typeof lat === 'number' ? lat : Number(lat);
  const lngNum = typeof lng === 'number' ? lng : Number(lng);

  return (
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180
  );
}

/**
 * Parse coordinate value to number
 */
export function parseCoordinate(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}
