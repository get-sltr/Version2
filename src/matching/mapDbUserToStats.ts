import { DbUser } from "./dbTypes"
import { UserStats } from "./buildUserFeatures"

function yearsBetween(a: Date, b: Date): number {
  return Math.floor(
    (a.getTime() - b.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  )
}

export function mapDbUserToStats(
  db: DbUser,
  now: Date
): UserStats {
  const age = yearsBetween(now, db.birthdate)

  const responseRate =
    db.messages_sent_7d > 0
      ? db.messages_replied_7d / db.messages_sent_7d
      : 0

  const popularityScore =
    Math.min(db.likes_received_30d / 100, 1)

  return {
    age,
    profileCompletion: db.profile_completed_percent / 100,
    activity7d: Math.min(db.likes_sent_7d / 50, 1),
    responseRate,
    avgResponseTimeMinutes: db.avg_response_minutes,
    sessionFrequency: Math.min(db.sessions_7d / 14, 1),
    lastActiveAt: db.last_active_at,
    popularityScore,
    verified: db.verified
  }
}

