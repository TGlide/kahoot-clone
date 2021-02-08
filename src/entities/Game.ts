export type Player = {
  points: number
  screen_name: string
  answer?: string
  correct?: boolean
}

export enum GameState {
  WAITING = "waitingForPlayers",
  PLAYING = "playing",
  LEADERBOARD = "leaderboard",
}

export type Game = {
  players: {
    [key: string]: Player
  }
  state: GameState
  promptIdx?: number
}
