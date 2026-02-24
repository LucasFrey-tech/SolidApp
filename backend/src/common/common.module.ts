import { Module } from '@nestjs/common';
import { HashService } from './bcryptService/hashService';
import { SettingsService } from './settings/settings.service';

@Module({
  providers: [HashService, SettingsService],
  exports: [HashService, SettingsService],
})
export class CommonModule {}
