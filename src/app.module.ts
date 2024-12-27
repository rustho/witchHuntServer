import { Module } from '@nestjs/common';
import { SheetsModule } from './excel/sheets.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    SheetsModule,
    TelegramModule,
  ],

  exports: [SheetsModule],
})
export class AppModule {}
