import { MATCHING_EXPERIMENT } from "./experimentConfig"

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function isInAiMatching(userId: string): boolean {
  if (!MATCHING_EXPERIMENT.enabled) return false

  const bucket = hashString(userId) % 100
  return bucket < MATCHING_EXPERIMENT.trafficPercent
}

