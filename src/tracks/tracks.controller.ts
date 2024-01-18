import {
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { Response } from 'express';
import { createReadStream } from 'fs';
import * as fs from 'fs';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

const path = '/public/files/tracks/';

const fullPath = join(__dirname, '../..', path);
console.log(fullPath);

export const storage = diskStorage({
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
});

export const trackFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(mp3)$/)) {
    req.fileValidationError = 'Only mp3 file were allowed';
  }
  cb(null, true);
};

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  async list() {
    return await this.tracksService.list();
  }

  @Delete()
  async delete(@Query('id') id: string) {
    return await this.tracksService.delete(id);
  }

  @Post()
  // @UseInterceptors(
  //   LocalFilesInterceptor({
  //     fieldName: 'file',
  //     path: '/tracks',
  //     fileFilter: (request, file, callback) => {
  //       if (!file.mimetype.includes('audio')) {
  //         return callback(
  //           new BadRequestException('Provide a valid audio'),
  //           false,
  //         );
  //       }
  //       callback(null, true);
  //     },
  //   }),
  // )
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        // fileSize: 5 * 10 * 10 * 10 * 10 * 10 * 10 * 10, // 50 mb in bytes
        // fileSize: 1000000, // in bytes -> 1 mb
      },
      storage: storage,
      fileFilter: trackFilter,
    }),
  )
  async addTracks(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return await this.tracksService.create({
      filename: file.originalname,
      path: path + file.filename,
      mimetype: file.mimetype,
    });
  }

  @Get(':id')
  @Header('Accept-Ranges', 'bytes')
  async streamAudio(
    @Param('id') id: string,
    @Headers('range') range: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    if (!range) {
      const trackMetadata = await this.tracksService.getTrackMetadata(id);
      const stat = fs.statSync(join(__dirname, '../..', trackMetadata.path));

      const file = createReadStream(
        join(__dirname, '../..', trackMetadata.path),
      );
      res.header({
        'Content-Type': `${trackMetadata.mimetype}`,
        'Content-Disposition': `inline; filename="${trackMetadata.name}"`,
        'Content-Length': `${stat.size}`,
      });

      return new StreamableFile(file).setErrorHandler((err) => {
        console.log(err.message, 'asu');
      });
    }
    const { streamableFile, contentRange } =
      await this.tracksService.getPartialTrackStream(id, range);

    res.status(206);

    res.set({
      'Content-Range': contentRange,
    });

    return streamableFile;
  }
}
