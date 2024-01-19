import { FilesInterceptor } from '@nestjs/platform-express';
import {
  BadRequestException,
  Injectable,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

interface LocalFilesInterceptorOptions {
  fieldName: string;
  path?: string;
  fileFilter?: MulterOptions['fileFilter'];
}

const trackFilter = (req, file, cb) => {
  if (!file.mimetype.includes('audio')) {
    return cb(new BadRequestException('Provide a valid audio'), false);
  }
  cb(null, true);
};

function MultipleTrackUploadFilesInterceptor(
  options: LocalFilesInterceptorOptions,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    filesInterceptor: NestInterceptor;
    constructor(configService: ConfigService) {
      const path = '/public/files/';

      const trackUploadLimit = configService.get<number>(
        'APP_TRACK_UPLOAD_LIMIT',
      );

      const destination = `${path}${options.path}`;
      const fullPath = join(__dirname, '../..', destination);

      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination: (req, file, cb) => {
            // Create folder if not exists
            fs.mkdirSync(fullPath, { recursive: true });

            cb(null, fullPath);
          },
          filename: (req, file, cb) => {
            const name = file.originalname.split(' ').join('-');
            const ext = extname(file.originalname);
            cb(null, name + '-' + Date.now() + ext);
          },
        }),
        fileFilter: trackFilter,
        limits: {
          files: +trackUploadLimit,
        },
      };

      this.filesInterceptor = new (FilesInterceptor(
        options.fieldName,
        +trackUploadLimit,
        multerOptions,
      ))();
    }

    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.filesInterceptor.intercept(...args);
    }
  }
  console.log(Interceptor);
  return mixin(Interceptor);
}

export default MultipleTrackUploadFilesInterceptor;
