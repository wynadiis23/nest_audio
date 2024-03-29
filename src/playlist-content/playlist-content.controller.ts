import {
  Body,
  Controller,
  Delete,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { PlaylistContentService } from './playlist-content.service';
import { PlaylistContentDto } from './dto/playlist-content.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Playlist Content')
@ApiBearerAuth()
@Controller('playlist-content')
export class PlaylistContentController {
  constructor(
    private readonly playlistContentService: PlaylistContentService,
  ) {}

  @ApiOperation({ summary: 'Add track/tracks to playlist' })
  @ApiBody({ type: PlaylistContentDto, required: true })
  @Post()
  async create(@Body() dto: PlaylistContentDto) {
    await this.playlistContentService.create(dto);

    return {
      message: 'successfully added playlist content',
    };
  }

  @ApiOperation({ summary: 'Remove playlist content' })
  @ApiQuery({
    name: 'playlistId',
    type: 'string',
    required: true,
    description: 'Id of playlist',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  @ApiQuery({
    name: 'trackIds',
    type: 'string',
    isArray: true,
    required: true,
    description: 'Ids of track',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  @Delete()
  async delete(
    @Query('playlistId', new ParseUUIDPipe()) playlistId: string,
    @Query('trackIds', new ParseUUIDPipe()) trackIds: string[],
  ) {
    if (!Array.isArray(trackIds)) {
      trackIds = [trackIds];
    }

    await this.playlistContentService.remove2(trackIds, playlistId);

    return {
      message: 'successfully remove playlist content',
    };
  }
}
