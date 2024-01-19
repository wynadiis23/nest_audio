import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistDto } from './dto/playlist.dto';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@ApiTags('Playlist')
@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  @ApiOperation({ summary: 'Create playlist' })
  @ApiBody({ type: PlaylistDto, required: true })
  async create(@Body() dto: PlaylistDto) {
    return await this.playlistService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all available playlist',
  })
  async list() {
    return await this.playlistService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detail of playlist based on playlist id' })
  @ApiParam({
    name: 'id',
    required: true,
    type: 'string',
  })
  async detail(@Param('id') id: string) {
    return await this.playlistService.detail(id);
  }

  @ApiOperation({ summary: 'Update playlist' })
  @ApiBody({ type: UpdatePlaylistDto, required: true })
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlaylistDto,
  ) {
    return await this.playlistService.update(id, dto);
  }
}
