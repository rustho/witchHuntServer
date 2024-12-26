export class PlayersSheetStatsDto {
  id: number;
  name: string;
  telegram: string;
  role: string;
  side: string;
  kills: number;
  isDead: number;
  isWin: number;
  isWinAndNotDead: number;
  foll: number;
  games: number;
}

export class GameSheetStatsDto {
  id: string;
  totalPlayers: number;
  roles: string[];
  witch: number;
  mir: number;
  shabash: boolean;
  totalKills: number;
  whoWin: string;
}
