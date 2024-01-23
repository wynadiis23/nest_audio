import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistDto } from './dto/playlist.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PublishedStatusEnum } from './enum';
import { Public } from '../authentication/decorator';

@ApiTags('Playlist')
@Public()
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
  @ApiQuery({
    name: 'published',
    type: 'string',
    enum: PublishedStatusEnum,
    required: false,
    description: 'Publish status',
    example: '1',
  })
  async list(
    @Query(
      'published',
      new DefaultValuePipe(PublishedStatusEnum.PUBLISHED),
      new ParseEnumPipe(PublishedStatusEnum),
    )
    published: PublishedStatusEnum,
  ) {
    return await this.playlistService.list(published);
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
    await this.playlistService.update(id, dto);

    return {
      message: 'successfully update playlist',
    };
  }
}
