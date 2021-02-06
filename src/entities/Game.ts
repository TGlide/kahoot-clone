export type Player = {
  points: number;
  screen_name: string;
};

export enum GameState {
  WAITING = "waitingForPlayers",
}

export type Game = {
  players: {
    [key: string]: Player;
  };
  state: GameState;
};
