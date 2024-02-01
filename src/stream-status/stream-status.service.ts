import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LastActivity } from '../last-activity/entity/last-activity.entity';
import { Repository } from 'typeorm';
import { UpdateLastActivityDBDto } from './dto';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { getCurrentDate } from '../utils';
import { streamStatusType } from './type';
import * as dayjs from 'dayjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UPDATE_STREAM_STATUS_EVENT_CONST } from '../event-gateway/const';
import { updateStreamStatusMessageType } from '../event-gateway/type';
import { UserService } from '../user/user.service';

@Injectable()
export class StreamStatusService {
  constructor(
    @InjectRepository(LastActivity)
    private readonly lastActivityRepository: Repository<LastActivity>,
    private readonly redisCacheService: RedisCacheService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updateLastActivityDB(payload: UpdateLastActivityDBDto) {
    try {
      return await this.lastActivityRepository.upsert(
        { user: payload.user, lastActivityTime: payload.lastActivityTime },
        ['user'],
      );
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getAllLastActivityFromDB() {
    try {
      return await this.lastActivityRepository.find();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getStreamStatus() {
    try {
      const date = getCurrentDate();
      const key = `${date}*`;

      // also get last activity to db
      // compare it with status from cache, if user not found in cache, use last activity from db
      // and set status to offline

      const lastActivityDB = await this.getAllLastActivityFromDB();
      const lastActivityCache: streamStatusType[] =
        await this.redisCacheService.getStreamStatusCache(key);

      const activity = lastActivityDB.map((db): streamStatusType => {
        const matchCached = lastActivityCache.find(
          (cache) => db.user === cache.name,
        );

        return {
          id: db.id,
          name: db.user,
          status: matchCached ? matchCached.status : 'offline',
          trackName: matchCached ? matchCached.trackName : null,
          album: matchCached ? matchCached.album || null : null,
          artist: matchCached ? matchCached.artist || null : null,
          lastActivity: dayjs(db.lastActivityTime).format(),
          ...matchCached,
        };
      });

      // send event to trigger websocket
      this.eventEmitter.emit(UPDATE_STREAM_STATUS_EVENT_CONST, activity);

      return activity;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async updateStreamStatus(message: updateStreamStatusMessageType) {
    try {
      const lastActivity = dayjs().format();

      const user = await this.userService.findOneById(message.id);

      if (!user) {
        return;
      }

      const streamStatus: streamStatusType = {
        id: message.id,
        name: user.name || null,
        status: message.status,
        trackName: message.trackName,
        album: message.album,
        artist: message.artist,
        lastActivity,
        ...message,
      };
      const date = getCurrentDate();
      const key = `${date}_${streamStatus.name}`;

      // process data to redis and db
      await this.redisCacheService.set(key, streamStatus);
      await this.updateLastActivityDB({
        lastActivityTime: new Date(lastActivity),
        user: user.name,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
