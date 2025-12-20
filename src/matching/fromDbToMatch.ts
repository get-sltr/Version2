import { DbUser } from "./dbTypes"
import { mapDbUserToStats } from "./mapDbUserToStats"
import { buildMatchPayload } from "./buildMatchPayload"
import { buildContext } from "./contextBuilder"

export function buildMatchFromDb(
  user: DbUser,
  candidates: DbUser[],
  now = new Date()
) {
  const userStats = mapDbUserToStats(user, now)

  const candidateStats = candidates.map(c =>
    mapDbUserToStats(c, now)
  )

  return buildMatchPayload(
    userStats,
    candidateStats,
    (c) => buildContext(user, c as any),
    now
  )
}

