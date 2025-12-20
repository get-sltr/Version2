export function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value))
}

export function normalizeAge(age: number): number {
  return clamp((age - 18) / (65 - 18))
}

export function normalizeDistance(km: number): number {
  return clamp(1 - Math.min(km, 100) / 100)
}

export function normalizeRecency(hoursAgo: number): number {
  return clamp(1 - Math.min(hoursAgo, 168) / 168)
}

export function normalizeRate(rate: number): number {
  return clamp(rate)
}

