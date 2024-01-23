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

  @ApiOperation({ summary: 'Add tracks to playlist' })
  @ApiBody({ type: PlaylistContentDto, required: true })
  @Post()
  async create(@Body() dto: PlaylistContentDto) {
    return await this.playlistContentService.create(dto);
  }
}
