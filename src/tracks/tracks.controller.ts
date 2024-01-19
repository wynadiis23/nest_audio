import {
  BadRequestException,
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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { Response } from 'express';
import { createReadStream } from 'fs';
import * as fs from 'fs';
import { join } from 'path';
import MultipleTrackUploadFilesInterceptor from '../utils/multipleTrackUploadFiles.interceptor';
import { TracksDto } from './dto';

const path = '/public/files/tracks/';

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
  @UseInterceptors(
    MultipleTrackUploadFilesInterceptor({
      fieldName: 'files',
      path: '/tracks',
    }),
  )
  async addTracks(@UploadedFiles() files: Array<Express.Multer.File>) {
    const tracks: TracksDto[] = files.map((file) => ({
      name: file.originalname,
      path: path + file.filename,
      mimetype: file.mimetype,
    }));

    return await this.tracksService.createMultiple({
      tracks: tracks,
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
