export class StatsDto {
  stats: {
    id: number;
    name: string;
    telegram: string;
    role: string;
    side: string;
    kills: number;
    isDead: boolean;
    isWin: boolean;
    isWinAndNotDead: boolean;
    foll: number;
  }[];
}
