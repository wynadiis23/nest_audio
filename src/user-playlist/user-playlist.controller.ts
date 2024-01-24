import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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
    summary:
      'Get list of playlist specified by user. user taken from token. (LISTENER)',
  })
  async getUserPlaylist(@Req() req: any) {
    return await this.userPlaylistService.getUserPlaylist(req.user.sub);
  }

  @Delete()
  @Public()
  @ApiOperation({
    summary: 'Remove playlist for specified user',
  })
  @ApiQuery({
    name: 'userId',
    type: 'string',
    required: true,
    description: 'User id',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  @ApiQuery({
    name: 'playlistId',
    type: 'string',
    required: true,
    description: 'Playlist id',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  async removeUserPlaylist(
    @Query('userId') userId: string,
    @Query('playlistId') playlistId: string,
  ) {
    await this.userPlaylistService.remove(userId, playlistId);

    return {
      message: 'successfully remove user playlist',
    };
  }
}
