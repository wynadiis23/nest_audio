import {
  Body,
  Controller,
  Delete,
  Get,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  ValidationPipe,
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
  async create(@Body(ValidationPipe) dto: AddUserPlaylistDto) {
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
    return await this.userPlaylistService.getPublishedUserPlaylist(
      req.user.sub,
    );
  }

  @Delete()
  @Public()
  @ApiOperation({
    summary: 'Remove user from specified playlist',
  })
  @ApiQuery({
    name: 'playlistId',
    type: 'string',
    required: true,
    description: 'Playlist id',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  @ApiQuery({
    name: 'userIds',
    type: 'string',
    isArray: true,
    required: true,
    description: 'User id',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  async removeUserPlaylist(
    @Query('playlistId', new ParseUUIDPipe()) playlistId: string,
    @Query('userIds', new ParseUUIDPipe()) userIds: string[],
  ) {
    if (!Array.isArray(userIds)) {
      userIds = [userIds];
    }
    await this.userPlaylistService.remove(userIds, playlistId);

    return {
      message: 'successfully remove user playlist',
    };
  }

  // get list of user that not yet added to given playlist
  @Get('/get/available-user')
  @Public()
  @ApiOperation({
    summary: 'Get all user that not yet added to given playlist',
  })
  @ApiQuery({
    name: 'playlistId',
    type: 'string',
    required: true,
    description: 'Playlist id',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  async availableUserForPlaylist(
    @Query('playlistId', new ParseUUIDPipe())
    playlistId: string,
  ) {
    console.log(playlistId);

    return await this.userPlaylistService.getAvailableUser(playlistId);
  }
}
