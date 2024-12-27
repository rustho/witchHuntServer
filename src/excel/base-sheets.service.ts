import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class BaseSheetsService {
  protected readonly SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
  protected readonly sheets = google.sheets({
    version: 'v4',
    auth: this.getAuth(),
  });

  protected getAuth() {
    return new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

   generateSheetRange(tableName: string, columnsCount: number): string {
    const startColumn = 'A';
    const endColumn = String.fromCharCode('A'.charCodeAt(0) + columnsCount - 1);
    return `${tableName}!${startColumn}:${endColumn}`;
  }
} 