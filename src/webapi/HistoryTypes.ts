export type History = {
  "match": Match,
  "events": Event[],
  "users": User[],
  "latest_event_id": number,
  "current_game_id": number | null
}

export type Match = {
  "id": number,
  "start_time": string,
  "end_time": string | null,
  "name": string
}

export type Event = {
  "id": number,
  "detail": {
    "type": EventType,
    "text"?: string
  },
  "game"?: any,
  "timestamp": string,
  "user_id": number | null
}

export type EventType = "match-created" | "match-disbanded" |
"host-changed" | "player-joined" | "player-left" | "player-kicked" |
"other";

export type User = {
  "avatar_url": string | null,
  "country_code": string,
  "default_group": string,
  "id": number,
  "is_active": boolean,
  "is_bot": boolean,
  "is_online": boolean,
  "is_supporter": boolean,
  "last_visit": string,
  "pm_friends_only": boolean,
  "profile_colour": string | null,
  "username": string,
  "country": {
    "code": string,
    "name": string
  }
}