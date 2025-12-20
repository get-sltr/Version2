import { DbUser } from "./dbTypes"
import { haversineKm } from "./distance"

export function buildContext(
  from: DbUser,
  to: DbUser
) {
  return {
    distanceKm: haversineKm(
      from.lat,
      from.lng,
      to.lat,
      to.lng
    )
  }
}

