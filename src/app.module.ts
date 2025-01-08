import { Module } from '@nestjs/common';
import { SheetsModule } from './excel/sheets.module';
import { TelegramModule } from './telegram/telegram.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [SheetsModule, TelegramModule],
  controllers: [HealthController],
  providers: [],
  exports: [SheetsModule],
})
export class AppModule {}
