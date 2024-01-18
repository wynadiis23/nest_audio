import { Body, Controller, Post } from '@nestjs/common';
import { PlaylistContentService } from './playlist-content.service';
import { PlaylistContentDto } from './dto/playlist-content.dto';

@Controller('playlist-content')
export class PlaylistContentController {
  constructor(
    private readonly playlistContentService: PlaylistContentService,
  ) {}

  @Post()
  async create(@Body() dto: PlaylistContentDto) {
    return await this.playlistContentService.create(dto);
  }
}
