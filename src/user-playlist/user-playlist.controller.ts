import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
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
import { OperatorEnum, SortEnum } from '../common/enum';
import { IDataTable } from '../common/interface';

@ApiTags('User Specified Playlist')
@ApiBearerAuth()
@Controller('user-playlist')
export class UserPlaylistController {
  constructor(private readonly userPlaylistService: UserPlaylistService) {}

  @Post()
  @ApiOperation({ summary: 'Add playlist to specified user' })
  @ApiBody({ type: AddUserPlaylistDto, required: true })
  async create(@Body(ValidationPipe) dto: AddUserPlaylistDto) {
    await this.userPlaylistService.add(dto);

    return {
      message: 'successfully added user to playlist',
    };
  }

  @Get('/user-specified')
  @ApiQuery({
    name: 'filterBy',
    type: 'string',
    required: false,
    description: 'Filter by property',
    example: 'name',
  })
  @ApiQuery({
    name: 'filterOperator',
    type: 'string',
    enum: OperatorEnum,
    required: false,
    description: 'Filter operator',
    example: 'CONTAINS',
  })
  @ApiQuery({
    name: 'filterValue',
    type: 'string',
    required: false,
    description: 'Filter value',
    example: 'Playlist name',
  })
  @ApiQuery({
    name: 'sortBy',
    type: 'string',
    required: false,
    description: 'Sort by property',
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    type: 'string',
    enum: SortEnum,
    required: false,
    description: 'Sort order',
    example: 'ASC',
  })
  @ApiQuery({
    name: 'pageIndex',
    type: 'number',
    required: false,
    description: 'Page index',
    example: 0,
  })
  @ApiQuery({
    name: 'pageSize',
    type: 'number',
    required: false,
    description: 'Page size',
    example: 20,
  })
  @ApiOperation({
    summary:
      'Get list of playlist specified by user. user taken from token. (LISTENER)',
  })
  async getUserPlaylist(
    @Req() req: any,
    @Query('filterBy', new DefaultValuePipe('name')) filterBy: string,
    @Query(
      'filterOperator',
      new DefaultValuePipe(OperatorEnum.CONTAINS),
      new ParseEnumPipe(OperatorEnum),
    )
    filterOperator: OperatorEnum,
    @Query('filterValue', new DefaultValuePipe('')) filterValue: string,
    @Query('sortBy', new DefaultValuePipe('name')) sortBy: string,
    @Query(
      'sortOrder',
      new DefaultValuePipe(SortEnum.ASC),
      new ParseEnumPipe(SortEnum),
    )
    sortOrder: SortEnum,
    @Query('pageIndex', new DefaultValuePipe(0), ParseIntPipe)
    pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(0), ParseIntPipe)
    pageSize: number,
  ) {
    const dataTableOptions: IDataTable = {
      filterBy,
      filterOperator,
      filterValue,
      sortBy,
      sortOrder,
      pageIndex,
      pageSize,
    };

    return await this.userPlaylistService.getPublishedUserPlaylist(
      dataTableOptions,
      req.user.sub,
    );
  }

  @Get('/published')
  @ApiQuery({
    name: 'filterBy',
    type: 'string',
    required: false,
    description: 'Filter by property',
    example: 'name',
  })
  @ApiQuery({
    name: 'filterOperator',
    type: 'string',
    enum: OperatorEnum,
    required: false,
    description: 'Filter operator',
    example: 'CONTAINS',
  })
  @ApiQuery({
    name: 'filterValue',
    type: 'string',
    required: false,
    description: 'Filter value',
    example: 'Playlist name',
  })
  @ApiQuery({
    name: 'sortBy',
    type: 'string',
    required: false,
    description: 'Sort by property',
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    type: 'string',
    enum: SortEnum,
    required: false,
    description: 'Sort order',
    example: 'ASC',
  })
  @ApiQuery({
    name: 'pageIndex',
    type: 'number',
    required: false,
    description: 'Page index',
    example: 0,
  })
  @ApiQuery({
    name: 'pageSize',
    type: 'number',
    required: false,
    description: 'Page size',
    example: 20,
  })
  @ApiOperation({
    summary: 'Get list of published playlist',
  })
  async getPublishedPlaylist(
    @Query('filterBy', new DefaultValuePipe('name')) filterBy: string,
    @Query(
      'filterOperator',
      new DefaultValuePipe(OperatorEnum.CONTAINS),
      new ParseEnumPipe(OperatorEnum),
    )
    filterOperator: OperatorEnum,
    @Query('filterValue', new DefaultValuePipe('')) filterValue: string,
    @Query('sortBy', new DefaultValuePipe('name')) sortBy: string,
    @Query(
      'sortOrder',
      new DefaultValuePipe(SortEnum.ASC),
      new ParseEnumPipe(SortEnum),
    )
    sortOrder: SortEnum,
    @Query('pageIndex', new DefaultValuePipe(0), ParseIntPipe)
    pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(0), ParseIntPipe)
    pageSize: number,
  ) {
    const dataTableOptions: IDataTable = {
      filterBy,
      filterOperator,
      filterValue,
      sortBy,
      sortOrder,
      pageIndex,
      pageSize,
    };

    return await this.userPlaylistService.getPublishedPlaylist(
      dataTableOptions,
    );
  }

  @Delete()
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
