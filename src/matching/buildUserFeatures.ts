import {
  normalizeAge,
  normalizeDistance,
  normalizeRecency,
  normalizeRate,
  clamp
} from "./normalizers"

export type FeatureContext = {
  distanceKm: number
}

export type FeatureContextWithNow = FeatureContext & {
  now: Date
}

export type UserStats = {
  age: number
  profileCompletion: number
  activity7d: number
  responseRate: number
  avgResponseTimeMinutes: number
  sessionFrequency: number
  lastActiveAt: Date
  popularityScore: number
  verified: boolean
}

export function buildUserFeatures(
  user: UserStats,
  ctx: FeatureContextWithNow
): number[] {
  const hoursAgo =
    (ctx.now.getTime() - user.lastActiveAt.getTime()) / 36e5

  return [
    normalizeAge(user.age),
    normalizeDistance(ctx.distanceKm),
    clamp(user.profileCompletion),
    clamp(user.activity7d),
    normalizeRate(user.responseRate),
    clamp(1 - Math.min(user.avgResponseTimeMinutes, 1440) / 1440),
    clamp(user.sessionFrequency),
    normalizeRecency(hoursAgo),
    clamp(user.popularityScore),
    user.verified ? 1 : 0
  ]
}

