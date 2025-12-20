import { buildUserFeatures, UserStats, FeatureContext } from "./buildUserFeatures"

export function buildMatchPayload(
  user: UserStats,
  candidates: UserStats[],
  ctxBuilder: (candidate: UserStats) => FeatureContext,
  now: Date
) {
  const userCtx = ctxBuilder(user)
  const userFeatures = buildUserFeatures(user, {
    ...userCtx,
    now
  })

  const candidateFeatures = candidates.map(candidate =>
    buildUserFeatures(candidate, {
      ...ctxBuilder(candidate),
      now
    })
  )

  return {
    user_features: userFeatures,
    candidates: candidateFeatures
  }
}

