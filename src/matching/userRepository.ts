import { DbUser } from "./dbTypes"

export async function getUserById(id: string): Promise<DbUser> {
  // REPLACE with real DB query
  throw new Error("getUserById not implemented")
}

export async function getCandidateUsers(
  userId: string,
  limit = 100
): Promise<DbUser[]> {
  // REPLACE with real DB query
  throw new Error("getCandidateUsers not implemented")
}

