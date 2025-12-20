export async function scoreMatches(payload: {
  user_features: number[]
  candidates: number[][]
}): Promise<number[]> {
  const aiServiceUrl = process.env.AI_MATCHING_SERVICE_URL;

  if (!aiServiceUrl) {
    console.warn('AI_MATCHING_SERVICE_URL not configured, returning neutral scores');
    return payload.candidates.map(() => 0.5);
  }

  const res = await fetch(`${aiServiceUrl}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    throw new Error("AI service error")
  }

  const data = await res.json()
  return data.scores
}

