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
  /*
  const extra = '/tracks';
  const name = file.originalname.split(' ').join('-');
  const dir = join(__dirname, '../..', `${path}${extra}`);

  // create folder if not exists
  fs.mkdirSync(dir, { recursive: true });

  const dirCont = fs.readdirSync(dir);
  const files = dirCont.filter((elm) => elm.startsWith(name));

  if (files.length) {
    cb(null, false);
    return;
  }
*/
  const allowedExtensions = ['.mp3'];
  const isAllowedExtension = allowedExtensions.some((ext) =>
    file.originalname.match(new RegExp(`\\${ext}$`)),
  );
  if (!isAllowedExtension) {
    return cb(
      new BadRequestException(
        `Provide a valid audio. Allowed extension were ${allowedExtensions}`,
      ),
      false,
    );
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
      const trackUploadLimit = configService.get<number>(
        'APP_TRACK_UPLOAD_LIMIT',
      );

      const destination = configService.get<string>('APP_TRACK_FOLDER');
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
          // fileSize: 10485760, // 10 Mb allowed
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
  return mixin(Interceptor);
}

export default MultipleTrackUploadFilesInterceptor;
