import { Injectable } from '@nestjs/common';
import { BaseSheetsService } from './base-sheets.service';
import { StatsDto } from './dto/stats.dto';
import { GoogleSheetsError } from './types';
import { DEFAULT_RANGES } from './constants';

@Injectable()
export class GameHistorySheetsService extends BaseSheetsService {
  async parseSheetGameToJson(
    range: string,
  ): Promise<StatsDto['gameStats'][] | null> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.SPREADSHEET_ID,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) return null;

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
      throw new GoogleSheetsError(`Failed to fetch Google Sheet data`, error);
    }
  }

  async getGameStatsFromSheet(
    range: string = DEFAULT_RANGES.GAME_HISTORY,
  ): Promise<any> {
    return this.parseSheetGameToJson(range);
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
      throw new GoogleSheetsError(
        `Failed to post game history to Google Sheet`,
        error,
      );
    }
  }
} 