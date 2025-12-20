export type DbUser = {
  id: string
  birthdate: Date
  lat: number
  lng: number

  profile_completed_percent: number

  likes_sent_7d: number
  messages_sent_7d: number
  messages_replied_7d: number
  avg_response_minutes: number

  sessions_7d: number
  last_active_at: Date

  likes_received_30d: number
  verified: boolean
}

