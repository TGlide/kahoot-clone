export type Player = {
  points: number;
  screen_name: string;
};

export type Game = {
  players: {
    [key: string]: Player;
  };
  state: string;
};
