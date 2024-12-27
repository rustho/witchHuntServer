import { Module } from '@nestjs/common';
import { SheetsModule } from './excel/sheets.module';

@Module({
  imports: [SheetsModule],

  exports: [SheetsModule],
})
export class AppModule {}
