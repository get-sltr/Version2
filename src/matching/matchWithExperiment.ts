import { DbUser } from "./dbTypes"
import { isInAiMatching } from "./experimentAssign"
import { runMatching } from "./matchService"
import { legacyMatch } from "./legacyMatch"

export async function matchWithExperiment(
  user: DbUser,
  candidates: DbUser[]
) {
  if (isInAiMatching(user.id)) {
    return runMatching(user, candidates)
  }

  return legacyMatch(user, candidates)
}

