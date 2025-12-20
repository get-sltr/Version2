import { DbUser } from "./dbTypes"

export async function legacyMatch(
  user: DbUser,
  candidates: DbUser[]
) {
  // EXISTING SLTR LOGIC GOES HERE
  // distance, recency, manual ranking, etc.

  return candidates.map(c => ({
    item: c,
    score: 0
  }))
}

