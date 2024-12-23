import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { UserDto } from './dto/user.dto';

@Controller('sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService) {}

  @Get('players')
  async getPlayers(
    @Query('range') range: string = 'Players!A:C',
  ): Promise<UserDto[]> {
    return this.sheetsService.parseSheetToJson(range);
  }

  @Post('statistic')
  async postStatistic(
    @Query('spreadsheetId') spreadsheetId: string,
    @Query('range') range: string = 'Statistics!A:C',
    @Body() data: any,
  ): Promise<void> {
    await this.sheetsService.postStatisticToSheet(spreadsheetId, range, data);
  }

  @Post('game-history')
  async postGameHistory(
    @Query('spreadsheetId') spreadsheetId: string,
    @Query('range') range: string = 'GameHistory!A:C',
    @Body() data: any,
  ): Promise<void> {
    await this.sheetsService.postGameHistoryToSheet(spreadsheetId, range, data);
  }
}
