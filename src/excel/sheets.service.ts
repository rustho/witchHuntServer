import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { UserDto } from './dto/user.dto';

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

  async postStatisticToSheet(
    spreadsheetId: string,
    range: string,
    data: any,
  ): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [data],
        },
      });
    } catch (error) {
      throw new Error(`Failed to post data to Google Sheet: ${error.message}`);
    }
  }

  async postGameHistoryToSheet(
    spreadsheetId: string,
    range: string,
    data: any,
  ): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [data],
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to post game history to Google Sheet: ${error.message}`,
      );
    }
  }
}
