import { Injectable } from '@nestjs/common';
import { SheetsService } from '../excel/sheets.service';

@Injectable()
export class TelegramService {
  constructor(private readonly sheetsService: SheetsService) {}

  async saveUserName(telegramNickname: string, userName: string): Promise<void> {
    await this.sheetsService.addPlayer({
      name: userName,
      telegram: telegramNickname,
    });
  }
} 