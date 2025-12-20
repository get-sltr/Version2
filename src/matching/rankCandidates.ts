export function rankCandidates<T>(
  candidates: T[],
  scores: number[]
): { item: T; score: number }[] {
  return candidates
    .map((item, i) => ({
      item,
      score: scores[i]
    }))
    .sort((a, b) => b.score - a.score)
}

