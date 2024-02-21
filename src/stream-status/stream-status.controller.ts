import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { StreamStatusService } from './stream-status.service';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { OperatorEnum, SortEnum } from '../common/enum';
import { IDataTable } from '../common/interface';
import { UserStatusEnum } from './enum';

@ApiTags('Stream Status')
@ApiBearerAuth()
@Controller('stream-status')
export class StreamStatusController {
  constructor(
    private readonly streamStatusService: StreamStatusService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  // @Post('/update-status')
  // @ApiOperation({
  //   summary: 'Update user currently playing and status',
  // })
  // @ApiBody({ type: UpdateStreamStatusDto, required: true })
  // async updateStreamStatus(@Body() dto: UpdateStreamStatusDto) {
  //   const date = getCurrentDate();
  //   const username = 'static-username';
  //   const key = `${date}_${username}`;
  //   const value = {
  //     user: username,
  //     status: dto.status,
  //     trackName: dto.trackName,
  //     lastActivity: dayjs().format(),
  //   };

  //   // store last activity to db
  //   await this.streamStatusService.updateLastActivityDB({
  //     user: username,
  //     lastActivityTime: new Date(),
  //   });

  //   return await this.redisCacheService.set(key, value);
  //   // store to redis
  // }

  @Get('/stream-status')
  @ApiQuery({
    name: 'userStatus',
    type: 'string',
    enum: UserStatusEnum,
    required: false,
    description: 'User status',
    example: UserStatusEnum.ONLINE,
  })
  @ApiQuery({
    name: 'filterBy',
    type: 'string',
    required: false,
    description: 'Filter by property',
    example: 'user',
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
    example: 'ARTO',
  })
  @ApiQuery({
    name: 'sortBy',
    type: 'string',
    required: false,
    description: 'Sort by property',
    example: 'user',
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
    summary: 'Get user activity stream status',
  })
  async streamStatus(
    @Query('userStatus', new DefaultValuePipe(''))
    userStatus: UserStatusEnum,
    @Query('filterBy', new DefaultValuePipe('user')) filterBy: string,
    @Query(
      'filterOperator',
      new DefaultValuePipe(OperatorEnum.CONTAINS),
      new ParseEnumPipe(OperatorEnum),
    )
    filterOperator: OperatorEnum,
    @Query('filterValue', new DefaultValuePipe('')) filterValue: string,
    @Query('sortBy', new DefaultValuePipe('user')) sortBy: string,
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

    return await this.streamStatusService.getStreamStatus(
      dataTablePayload,
      userStatus,
    );
  }
}
