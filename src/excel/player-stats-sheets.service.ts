import { Injectable } from '@nestjs/common';
import { BaseSheetsService } from './base-sheets.service';
import { StatsDto } from './dto/stats.dto';
import { PlayersSheetStatsDto } from './dto/statsSheets.dto';
import { GoogleSheetsError } from './types';
import { DEFAULT_RANGES } from './constants';

@Injectable()
export class PlayerStatsSheetsService extends BaseSheetsService {
    private createRowData(
        newStat: StatsDto['playersStats'][0],
        existingStats: PlayersSheetStatsDto[],
        existingPlayerIndex: number,
      ): string[] {
        const existingPlayer =
          existingPlayerIndex >= 0 ? existingStats[existingPlayerIndex] : null;
    
        const id = existingPlayer?.id ?? existingStats.length + 1;
        const existingKills = Number.isNaN(Number(existingPlayer?.kills))
          ? 0
          : Number(existingPlayer?.kills);
        const totalKills = (existingKills + (newStat.kills || 0)).toString();
    
        const existingFoll = Number.isNaN(Number(existingPlayer?.foll))
          ? 0
          : Number(existingPlayer?.foll);
        const totalFoll = (existingFoll + (newStat.foll || 0)).toString();
    
        const existingIsDead = Number.isNaN(Number(existingPlayer?.isDead))
          ? 0
          : Number(existingPlayer?.isDead);
        const isDead = newStat.isDead ? existingIsDead + 1 : existingIsDead;
    
        const existingIsWin = Number.isNaN(Number(existingPlayer?.isWin))
          ? 0
          : Number(existingPlayer?.isWin);
        const isWin = newStat.isWin ? existingIsWin + 1 : existingIsWin;
    
        const existingIsWinAndNotDead = Number.isNaN(
          Number(existingPlayer?.isWinAndNotDead),
        )
          ? 0
          : Number(existingPlayer?.isWinAndNotDead);
        const isWinAndNotDead = newStat.isWinAndNotDead
          ? existingIsWinAndNotDead + 1
          : existingIsWinAndNotDead;
    
        const existingGames = Number.isNaN(Number(existingPlayer?.games))
          ? 0
          : Number(existingPlayer?.games);
        const games = existingGames + 1;
    
        return [
          id.toString(),
          newStat.name,
          newStat.telegram,
          newStat.role,
          newStat.side,
          totalKills,
          isDead ? isDead.toString() : existingIsDead.toString(),
          isWin ? isWin.toString() : existingIsWin.toString(),
          isWinAndNotDead
            ? isWinAndNotDead.toString()
            : existingIsWinAndNotDead.toString(),
          totalFoll,
          games.toString(),
        ];
      };

  async parseSheetPlayersToJson(
    range: string,
  ): Promise<StatsDto['playersStats'] | null> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.SPREADSHEET_ID,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) return null;

      return rows.slice(1).map((row) => ({
        id: Number(row[0]),
        name: row[1],
        telegram: row[2],
        role: row[3],
        side: row[4],
        kills: Number(row[5]),
        isDead: row[6] === '1',
        isWin: row[7] === '1',
        isWinAndNotDead: row[8] === '1',
        foll: Number(row[9]),
        games: Number.isNaN(Number(row[10])) ? 0 : Number(row[10]),
      }));
    } catch (error) {
      throw new GoogleSheetsError(`Failed to fetch Google Sheet data`, error);
    }
  }

  async getPlayersStatsFromSheet(
    range: string = DEFAULT_RANGES.STATS,
  ): Promise<any> {
    return this.parseSheetPlayersToJson(range);
  }

  async postStatisticToSheet(
    range: string,
    newStats: StatsDto['playersStats'],
  ): Promise<void> {
    try {
      const existingStats = await this.getPlayersStatsFromSheet(range);
      const updates = [];
      let newPlayersCount = 0;

      for (const newStat of newStats) {
        const existingPlayerIndex = existingStats.findIndex(
          (existing) => existing.telegram === newStat.telegram,
        );

        const rowData = this.createRowData(
          newStat,
          existingStats,
          existingPlayerIndex,
        );

        if (existingPlayerIndex >= 0) {
          updates.push({
            range: `${range.split('!')[0]}!A${existingPlayerIndex + 2}`,
            values: [rowData],
          });
        } else {
          updates.push({
            range: `${range.split('!')[0]}!A${
              existingStats.length + 2 + newPlayersCount
            }`,
            values: [rowData],
          });
          newPlayersCount++;
        }
      }

      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });
    } catch (error) {
      throw new GoogleSheetsError(
        `Failed to post game history to Google Sheet`,
        error,
      );
    }
  }
} 