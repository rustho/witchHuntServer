export const SheetNames = {
  STATS: 'Stats',
  GAME_HISTORY: 'GamesHistory',
} as const;
  
export const DEFAULT_RANGES = {
  STATS: `${SheetNames.STATS}!A:J`,
  GAME_HISTORY: `${SheetNames.GAME_HISTORY}!A:J`,
} as const;
