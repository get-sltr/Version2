import { DbUser } from "./dbTypes"
import { buildMatchFromDb } from "./fromDbToMatch"
import { scoreMatches } from "./aiClient"
import { rankCandidates } from "./rankCandidates"

export async function runMatching(
  user: DbUser,
  candidates: DbUser[]
) {
  const payload = buildMatchFromDb(user, candidates)
  const scores = await scoreMatches(payload)
  return rankCandidates(candidates, scores)
}

