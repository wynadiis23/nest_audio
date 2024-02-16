import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistDto } from './dto/playlist.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PublishedStatusEnum } from './enum';
import { OperatorEnum, SortEnum } from '../common/enum';
import { IDataTable } from '../common/interface';

@ApiTags('Playlist')
@ApiBearerAuth()
@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  @ApiOperation({ summary: 'Create playlist' })
  @ApiBody({ type: PlaylistDto, required: true })
  async create(@Body() dto: PlaylistDto) {
    await this.playlistService.create(dto);

    return {
      message: 'successfully created playlist',
    };
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
  async list(
    @Query(
      'published',
      new DefaultValuePipe(PublishedStatusEnum.PUBLISHED),
      new ParseEnumPipe(PublishedStatusEnum),
    )
    published: PublishedStatusEnum,
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
    const dataTablePayload: IDataTable = {
      filterBy,
      filterOperator,
      filterValue,
      sortBy,
      sortOrder,
      pageIndex,
      pageSize,
    };
    // add role check here, if role is admin, return all playlist. if general do not include user specified playlist
    return await this.playlistService.list(dataTablePayload, published);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detail of playlist based on playlist id' })
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
    example: 'Summit',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: 'string',
  })
  async detail(
    @Param('id') id: string,
    @Query('filterBy', new DefaultValuePipe('name')) filterBy: string,
    @Query(
      'filterOperator',
      new DefaultValuePipe(OperatorEnum.CONTAINS),
      new ParseEnumPipe(OperatorEnum),
    )
    filterOperator: OperatorEnum,
    @Query('filterValue', new DefaultValuePipe('')) filterValue: string,
  ) {
    const dataTablePayload: IDataTable = {
      filterBy,
      filterOperator,
      filterValue,
    };
    return await this.playlistService.detail(id, dataTablePayload);
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

  @ApiOperation({ summary: 'Delete playlist' })
  @ApiQuery({
    name: 'id',
    type: 'string',
    required: true,
    description: 'Id of playlist',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  @Delete()
  async delete(@Query('id') id: string) {
    await this.playlistService.delete(id);

    return {
      message: 'successfully deleted playlist',
    };
  }
}
