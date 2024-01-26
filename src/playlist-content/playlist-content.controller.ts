import { Body, Controller, Post } from '@nestjs/common';
import { PlaylistContentService } from './playlist-content.service';
import { PlaylistContentDto } from './dto/playlist-content.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  // @ApiOperation({ summary: 'Update track/tracks to playlist' })
  // @ApiBody({ type: UpdatePlaylistContentDto, required: true })
  // @Put(':id')
  // async remove(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() dto: UpdatePlaylistContentDto,
  // ) {
  //   await this.playlistContentService.update(id, dto);

  //   return {
  //     message: 'successfully update playlist content',
  //   };
  // }
}
