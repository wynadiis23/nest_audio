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
    name: 'id',
    type: 'string',
    isArray: true,
    required: true,
    description: 'Ids of playlist content',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  @Delete()
  async delete(@Query('id') ids: string[]) {
    await this.playlistContentService.remove(ids);

    return {
      message: 'successfully remove playlist content',
    };
  }
}
