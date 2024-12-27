import { Module } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { SheetsController } from './sheets.controller';
import { PlayerStatsSheetsService } from './player-stats-sheets.service';
import { GameHistorySheetsService } from './game-history-sheets.service';
import { BaseSheetsService } from './base-sheets.service';
import { PlayersSheetsService } from './players-sheets.service';

@Module({
  controllers: [SheetsController],
  providers: [
    SheetsService,
    PlayerStatsSheetsService,
    GameHistorySheetsService,
    BaseSheetsService,
    PlayersSheetsService,
  ],
  exports: [SheetsService],
})
export class SheetsModule {}
