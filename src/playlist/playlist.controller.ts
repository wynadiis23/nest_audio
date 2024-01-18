import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistDto } from './dto/playlist.dto';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  async create(@Body() dto: PlaylistDto) {
    return await this.playlistService.create(dto);
  }

  @Get()
  async list() {
    return await this.playlistService.list();
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return await this.playlistService.detail(id);
  }
}
