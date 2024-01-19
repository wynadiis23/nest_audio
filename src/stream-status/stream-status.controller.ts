import { Body, Controller, Get, Post } from '@nestjs/common';
import { StreamStatusService } from './stream-status.service';
import { UpdateStreamStatusDto } from './dto';
import { getCurrentDate } from '../utils';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import * as dayjs from 'dayjs';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Stream Status')
@Controller('stream-status')
export class StreamStatusController {
  constructor(
    private readonly streamStatusService: StreamStatusService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @Post('/update-status')
  @ApiOperation({
    summary: 'Update user currently playing and status',
  })
  @ApiBody({ type: UpdateStreamStatusDto, required: true })
  async updateStreamStatus(@Body() dto: UpdateStreamStatusDto) {
    const date = getCurrentDate();
    const username = 'static-username';
    const key = `${date}_${username}`;
    const value = {
      user: username,
      status: dto.status,
      trackName: dto.trackName,
      lastActivity: dayjs().format(),
    };

    // store last activity to db
    await this.streamStatusService.updateLastActivityDB({
      user: username,
      lastActivityTime: new Date(),
    });

    return await this.redisCacheService.set(key, value);
    // store to redis
  }

  @Get('/stream-status')
  @ApiOperation({
    summary: 'Get user activity stream status',
  })
  async streamStatus() {
    const date = getCurrentDate();
    const key = `${date}*`;

    // also get last activity to db
    // compare it with status from cache, if user not found in cache, use last activity from db
    // and set status to offline

    const lastActivityDB =
      await this.streamStatusService.getAllLastActivityFromDB();
    const lastActivityCache = await this.redisCacheService.getStreamStatusCache(
      key,
    );

    const activity = lastActivityDB.map((db) => {
      const matchCached = lastActivityCache.find(
        (cache) => db.user === cache.user,
      );

      return {
        user: db.user,
        status: matchCached ? matchCached.status : 'offline',
        trackName: matchCached ? matchCached.trackName : null,
        lastActivity: db.lastActivityTime,
      };
    });

    return activity;
  }
}
