import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SettingsService } from '../settings/settings.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const filename = `${Date.now()}${ext}`;
          cb(null, filename);
        },
        destination: SettingsService.getStaticResourcesPath(),
      }),
    }),
  ],
  providers: [SettingsService],
  exports: [MulterModule],
})
export class CommonMulterModule {}