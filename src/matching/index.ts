import { buildMatchPayload } from "./buildMatchPayload"
import { scoreMatches } from "./aiClient"
import { rankCandidates } from "./rankCandidates"
import { UserStats } from "./buildUserFeatures"

export async function matchUsers(
  user: UserStats,
  candidates: UserStats[],
  ctxBuilder: (u: UserStats) => { distanceKm: number },
  now = new Date()
) {
  const payload = buildMatchPayload(
    user,
    candidates,
    ctxBuilder,
    now
  )

  const scores = await scoreMatches(payload)

  return rankCandidates(candidates, scores)
}

