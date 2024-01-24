import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserPlaylistService } from './user-playlist.service';
import { AddUserPlaylistDto } from './dto';
import { Public } from '../authentication/decorator';

@ApiTags('User Specified Playlist')
@ApiBearerAuth()
@Controller('user-playlist')
export class UserPlaylistController {
  constructor(private readonly userPlaylistService: UserPlaylistService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Add playlist to specified user' })
  @ApiBody({ type: AddUserPlaylistDto, required: true })
  async create(@Body() dto: AddUserPlaylistDto) {
    await this.userPlaylistService.add(dto);

    return {
      message: 'successfully added user to playlist',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get list of playlist specified by user. user taken from token',
  })
  async getUserPlaylist(@Req() req: any) {
    return await this.userPlaylistService.getUserPlaylist(req.user.sub);
  }
}
