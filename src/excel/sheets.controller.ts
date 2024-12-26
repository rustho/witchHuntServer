import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { UserDto } from './dto/user.dto';
import { StatsDto } from './dto/stats.dto';

@Controller('sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService) {}

  @Get('players')
  async getPlayers(
    @Query('range') range: string = 'Players!A:C',
  ): Promise<UserDto[]> {
    return this.sheetsService.parseSheetToJson(range);
  }

  @Post('/stats')
  async postStatistic(
    @Query('range') range: string = 'Stats!A:J',
    @Body() data: StatsDto,
  ): Promise<void> {
    await this.sheetsService.postStats(range, data);
  }
}
