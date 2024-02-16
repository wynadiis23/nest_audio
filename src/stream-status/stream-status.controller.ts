import { Controller, Get } from '@nestjs/common';
import { StreamStatusService } from './stream-status.service';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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
  @ApiOperation({
    summary: 'Get user activity stream status',
  })
  async streamStatus() {
    return await this.streamStatusService.getStreamStatus();
  }
}
