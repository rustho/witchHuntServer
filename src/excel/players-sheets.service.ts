import { Injectable } from '@nestjs/common';
import { BaseSheetsService } from './base-sheets.service';
import { UserDto } from './dto/user.dto';
import { GoogleSheetsError } from './types';

@Injectable()
export class PlayersSheetsService extends BaseSheetsService {
  async getPlayers(range: string): Promise<UserDto[]> {
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
      throw new GoogleSheetsError(`Failed to fetch Google Sheet data`, error);
    }
  }

  async addPlayer(player: Partial<UserDto>): Promise<void> {
    const range = this.generateSheetRange('players', 3);

    const existingPlayers = await this.getPlayers(range);

    if (existingPlayers.find((p) => p.telegram.includes(player.telegram))) {
      throw new Error('Player already exists');
    }

    const id = existingPlayers.length + 1;

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[id, player.name, player.telegram]] },
    });
  }
} 