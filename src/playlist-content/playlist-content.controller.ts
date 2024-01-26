import { Body, Controller, Delete, Post, Query } from '@nestjs/common';
import { PlaylistContentService } from './playlist-content.service';
import { PlaylistContentDto } from './dto/playlist-content.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../authentication/decorator';

@ApiTags('Playlist Content')
@Public()
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
    name: 'trackId',
    type: 'string',
    isArray: true,
    required: true,
    description: 'Ids of track',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  @Delete()
  async delete(
    @Query('playlistId') playlistId: string,
    @Query('trackId') trackIds: string[],
  ) {
    console.log(playlistId);
    console.log(trackIds);
    await this.playlistContentService.remove2(trackIds, playlistId);

    return {
      message: 'successfully remove playlist content',
    };
  }
}
