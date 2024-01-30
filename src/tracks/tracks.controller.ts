import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Header,
  Headers,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
  Res,
  Sse,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { Response } from 'express';
import MultipleTrackUploadFilesInterceptor from '../utils/multiple-track-upload-files.interceptor';
import { TracksDto } from './dto';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Observable, fromEvent, map } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Public } from '../authentication/decorator';
import { OperatorEnum, SortEnum } from '../common/enum';
import { IDataTable } from '../common/interface';

const path = '/public/files/tracks/';

@ApiTags('Tracks')
@Public()
@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List of available track',
  })
  @ApiQuery({
    name: 'filterBy',
    type: 'string',
    required: false,
    description: 'Filter by property',
    example: 'name',
  })
  @ApiQuery({
    name: 'filterOperator',
    type: 'string',
    enum: OperatorEnum,
    required: false,
    description: 'Filter operator',
    example: 'CONTAINS',
  })
  @ApiQuery({
    name: 'filterValue',
    type: 'string',
    required: false,
    description: 'Filter value',
    example: 'Summit',
  })
  @ApiQuery({
    name: 'sortBy',
    type: 'string',
    required: false,
    description: 'Sort by property',
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    type: 'string',
    enum: SortEnum,
    required: false,
    description: 'Sort order',
    example: 'ASC',
  })
  @ApiQuery({
    name: 'pageIndex',
    type: 'number',
    required: false,
    description: 'Page index',
    example: 0,
  })
  @ApiQuery({
    name: 'pageSize',
    type: 'number',
    required: false,
    description: 'Page size',
    example: 20,
  })
  async list(
    @Query('filterBy', new DefaultValuePipe('name')) filterBy: string,
    @Query(
      'filterOperator',
      new DefaultValuePipe(OperatorEnum.CONTAINS),
      new ParseEnumPipe(OperatorEnum),
    )
    filterOperator: OperatorEnum,
    @Query('filterValue', new DefaultValuePipe('')) filterValue: string,
    @Query('sortBy', new DefaultValuePipe('name')) sortBy: string,
    @Query(
      'sortOrder',
      new DefaultValuePipe(SortEnum.ASC),
      new ParseEnumPipe(SortEnum),
    )
    sortOrder: SortEnum,
    @Query('pageIndex', new DefaultValuePipe(0), ParseIntPipe)
    pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(100), ParseIntPipe)
    pageSize: number,
  ) {
    const dataTablePayload: IDataTable = {
      filterBy,
      filterOperator,
      filterValue,
      sortBy,
      sortOrder,
      pageIndex,
      pageSize,
    };

    return await this.tracksService.list(dataTablePayload);
  }

  // list available track for playlist.
  // this will exclude any track that has been added to given playlist
  @Get('track-list/:playlistId')
  @ApiOperation({
    summary: 'Get list of available track for playlist',
  })
  @ApiParam({ name: 'playlistId', required: true, type: 'string' })
  async playlistAvailableTracks(@Param('playlistId') playlistId: string) {
    return await this.tracksService.getAvailableTrackForPlaylist(playlistId);
  }

  @Delete()
  @ApiOperation({
    summary:
      'Delete tracks. It will also delete track from playlist content. (DO NOT USE IT)',
  })
  @ApiQuery({
    name: 'id',
    type: 'string',
    required: true,
    description: 'Id of track',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  async delete(@Query('id') id: string) {
    return await this.tracksService.delete(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Add tracks. Can add multiple track up to upload limit',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Track to be added',
        },
      },
    },
  })
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

    // fetch metadata using music metadata package

    await this.tracksService.createMultiple({
      tracks: tracks,
    });

    return {
      message: 'successfully added track/tracks',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Stream track based on track id' })
  @ApiHeader({
    name: 'range',
    required: false,
  })
  @Header('Accept-Ranges', 'bytes')
  async streamAudio(
    @Param('id') id: string,
    @Headers('range') range: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    if (!range) {
      return await this.tracksService.getTrackStreamById(id);
    }
    const { streamableFile, contentRange } =
      await this.tracksService.getPartialTrackStream(id, range);

    res.status(206);

    res.set({
      'Content-Range': contentRange,
    });

    return streamableFile;
  }

  @Delete('/delete-all')
  @ApiOperation({ summary: 'Will delete all track. for dev purpose only' })
  async deleteAllTrack() {
    return await this.tracksService.deleteAllTrack();
  }

  @Sse('/sse/add-tracks')
  sse(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'add-tracks').pipe(
      map((data) => {
        return new MessageEvent('add-tracks', { data: data });
      }),
    );
  }

  // @Sse('/sse/upload-progress')
  // sseUploadProgress(): Observable<MessageEvent> {
  //   return fromEvent(this.eventEmitter, 'upload-progress').pipe(
  //     map((data) => {
  //       return new MessageEvent('upload-progress', { data: data });
  //     }),
  //   );
  // }
}
