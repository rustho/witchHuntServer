//{"stats":{"playersStats":[{"id":-861431,"name":"Игрок Жорже, tg george","telegram":"george","role":"Могильщик","side":"mir","kills":2,"isDead":true,"isWin":true,"isWinAndNotDead":false,"foll":0},{"id":1231231,"name":"Игрок Катерина, tg AnEkaterina","telegram":"AnEkaterina","role":"Сторож","side":"witch","kills":0,"isDead":true,"isWin":false,"isWinAndNotDead":false,"foll":0},{"id":-381398.6,"name":"Игрок Костя, tg koslev","telegram":"koslev","role":"Судья","side":"mir","kills":0,"isDead":false,"isWin":true,"isWinAndNotDead":true,"foll":0},{"id":-701420.2,"name":"Игрок Лена, tg witch","telegram":"witch","role":"Священник","side":"mir","kills":0,"isDead":false,"isWin":true,"isWinAndNotDead":true,"foll":2}],"gameStats":{"totalPlayers":4,"roles":["Могильщик","Сторож","Судья","Священник"],"witch":1,"mir":3,"shabash":false,"totalKills":2,"whoWin":"mir"}}}

export class StatsDto {
  playersStats: {
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
  gameStats: {
    id: string;
    totalPlayers: number;
    roles: string[];
    witch: number;
    mir: number;
    shabash: boolean;
    totalKills: number;
    whoWin: string;
  };
}
