import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { UserDto } from './dto/user.dto';
import { StatsDto } from './dto/stats.dto';
import { PlayersSheetStatsDto } from './dto/statsSheets.dto';

@Injectable()
export class SheetsService {
  private readonly SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
  private readonly sheets = google.sheets({
    version: 'v4',
    auth: this.getAuth(),
  });

  private getAuth() {
    return new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  private generateSheetRange(tableName: string, columnsCount: number): string {
    const startColumn = 'A';
    const endColumn = String.fromCharCode('A'.charCodeAt(0) + columnsCount - 1);
    return `${tableName}!${startColumn}:${endColumn}`;
  }

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
  }

  async parseSheetToJson(range: string): Promise<UserDto[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.SPREADSHEET_ID,
        range,
      });

      const rows = response.data.values;

      if (!rows || rows.length === 0) {
        return [];
      }

      // Skip header row and map data
      return rows.slice(1).map((row) => ({
        id: Number(row[0]),
        name: row[1],
        telegram: row[2],
      }));
    } catch (error) {
      throw new Error(`Failed to fetch Google Sheet data: ${error.message}`);
    }
  }

  async parseSheetPlayersToJson(
    range: string,
  ): Promise<StatsDto['playersStats'] | null> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.SPREADSHEET_ID,
        range,
      });

      const rows = response.data.values;

      if (!rows || rows.length === 0) {
        return null;
      }

      // Skip header row and map data
      const players = rows.slice(1).map((row) => ({
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

      return players;
    } catch (error) {
      throw new Error(`Failed to fetch Google Sheet data: ${error.message}`);
    }
  }

  async parseSheetGameToJson(
    range: string,
  ): Promise<StatsDto['gameStats'][] | null> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.SPREADSHEET_ID,
        range,
      });

      const rows = response.data.values;

      if (!rows || rows.length === 0) {
        return null;
      }

      // Skip header row and map data
      return rows.slice(1).map((row) => ({
        id: row[0],
        totalPlayers: Number(row[1]),
        roles: row[2].split(', '),
        witch: Number(row[3]),
        mir: Number(row[4]),
        shabash: row[5] === 'Yes',
        totalKills: Number(row[6]),
        whoWin: row[7],
      }));
    } catch (error) {
      throw new Error(`Failed to fetch Google Sheet data: ${error.message}`);
    }
  }

  async getPlayersStatsFromSheet(range: string = 'Stats!A:J'): Promise<any> {
    const data = await this.parseSheetPlayersToJson(range);
    return data;
  }

  async getGameStatsFromSheet(
    range: string = 'GamesHistory!A:J',
  ): Promise<any> {
    const data = await this.parseSheetGameToJson(range);
    return data;
  }

  async postStats(_range: string, data: StatsDto): Promise<void> {
    const { playersStats, gameStats } = data;

    const gameHistoryLength = Object.keys(gameStats).length;
    const gameHistoryRange = this.generateSheetRange(
      'GamesHistory',
      gameHistoryLength,
    );

    const existingGames = await this.getGameStatsFromSheet(gameHistoryRange);
    if (existingGames.find((game) => game.id === gameStats.id)) {
      return;
    }

    if (playersStats) {
      const statsLength = Object.keys(playersStats[0]).length + 1;
      const statsRange = this.generateSheetRange('Stats', statsLength);
      await this.postStatisticToSheet(statsRange, playersStats);
    }

    if (gameStats) {
      const gameHistoryLength = Object.keys(gameStats).length;
      const gameHistoryRange = this.generateSheetRange(
        'GamesHistory',
        gameHistoryLength,
      );
      await this.postGameHistoryToSheet(gameHistoryRange, gameStats);
    }
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
      console.error('Error updating statistics:', error);
      throw error;
    }
  }

  async postGameHistoryToSheet(
    range: string,
    data: StatsDto['gameStats'],
  ): Promise<void> {
    try {
      const formattedData = {
        ...data,
        roles: data.roles.join(', '),
      };

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.SPREADSHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              formattedData.id,
              formattedData.totalPlayers,
              formattedData.roles,
              formattedData.witch,
              formattedData.mir,
              formattedData.shabash ? 'Yes' : 'No',
              formattedData.totalKills,
              formattedData.whoWin,
            ],
          ],
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to post game history to Google Sheet: ${error.message}`,
      );
    }
  }
}
