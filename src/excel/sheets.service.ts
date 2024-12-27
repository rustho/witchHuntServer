import { Injectable } from '@nestjs/common';
import { StatsDto } from './dto/stats.dto';
import { SheetNames } from './constants';
import { PlayerStatsSheetsService } from './player-stats-sheets.service';
import { GameHistorySheetsService } from './game-history-sheets.service';
import { PlayersSheetsService } from './players-sheets.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class SheetsService {
  constructor(
    private readonly playerStatsService: PlayerStatsSheetsService,
    private readonly gameHistoryService: GameHistorySheetsService,
    private readonly playersService: PlayersSheetsService,
  ) {}

  async getPlayers(range: string): Promise<UserDto[]> {
    return this.playersService.getPlayers(range);
  }

  async addPlayer(player: Partial<UserDto>): Promise<void> {
    return this.playersService.addPlayer(player);
  }

  async postStats(_range: string, data: StatsDto): Promise<void> {
    const { playersStats, gameStats } = data;

    const gameHistoryLength = Object.keys(gameStats).length;
    const gameHistoryRange = this.gameHistoryService.generateSheetRange(
      'GamesHistory',
      gameHistoryLength,
    );

    const existingGames = await this.gameHistoryService.getGameStatsFromSheet(gameHistoryRange);
    if (existingGames.find((game) => game.id === gameStats.id)) {
      return;
    }

    if (playersStats) {
      const statsLength = Object.keys(playersStats[0]).length + 1;
      const statsRange = this.playerStatsService.generateSheetRange(
        SheetNames.STATS,
        statsLength,
      );
      await this.playerStatsService.postStatisticToSheet(statsRange, playersStats);
    }

    if (gameStats) {
      const gameHistoryLength = Object.keys(gameStats).length;
      const gameHistoryRange = this.gameHistoryService.generateSheetRange(
        SheetNames.GAME_HISTORY,
        gameHistoryLength,
      );
      await this.gameHistoryService.postGameHistoryToSheet(gameHistoryRange, gameStats);
    }
  }
}
