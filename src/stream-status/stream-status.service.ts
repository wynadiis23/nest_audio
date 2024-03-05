import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LastActivity } from '../last-activity/entity/last-activity.entity';
import { DeepPartial, Repository } from 'typeorm';
import { UpdateLastActivityDBDto } from './dto';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { streamStatusType } from './type';
import * as dayjs from 'dayjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CONNECTED_USER_PREF,
  UPDATE_STREAM_STATUS_EVENT_CONST,
} from '../event-gateway/const';
import { updateStreamStatusMessageType } from '../event-gateway/type';
import { UserService } from '../user/user.service';
import { IDataTable } from '../common/interface';
import { userConnectionType } from './type/user-connection.type';
import { User } from '../user/entity/user.entity';
import { UserStatusEnum } from './enum';
import { StreamStatusKey } from './utils';
import { STREAM_STATUS_TIME } from './const';

@Injectable()
export class StreamStatusService {
  constructor(
    @InjectRepository(LastActivity)
    private readonly lastActivityRepository: Repository<LastActivity>,
    private readonly redisCacheService: RedisCacheService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateLastActivityDB(payload: UpdateLastActivityDBDto) {
    try {
      let deepPartialLastActivity: DeepPartial<LastActivity>;

      const lastActivity: { id: string; clientKey: string } =
        await this.lastActivityRepository
          .createQueryBuilder('last_act')
          .select('last_act.id', 'id')
          .addSelect('last_act.client_key', 'clientKey')
          .where('user_id = :userId', { userId: payload.userId })
          .getRawOne();

      if (lastActivity) {
        deepPartialLastActivity = {
          id: lastActivity.id,
          lastActivityTime: payload.lastActivityTime,
          userId: payload.userId,
        };
      } else {
        deepPartialLastActivity = {
          lastActivityTime: payload.lastActivityTime,
          userId: payload.userId,
        };
      }

      // if current user already has client key, then do not set the client key again
      if (lastActivity?.clientKey) {
        payload.clientKey = null;
      }

      if (payload.clientKey) {
        deepPartialLastActivity.clientKey = payload.clientKey;
      }

      return await this.lastActivityRepository.save(deepPartialLastActivity);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getAllLastActivityFromDB() {
    try {
      let query = this.userRepository.createQueryBuilder('user');

      query = query.leftJoinAndSelect(
        'user.lastActivity',
        'last_activity',
        'user.id = last_activity.userId',
      );

      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getLastActivityFromDB(dataTableOptions: IDataTable) {
    try {
      let entity = 'last_activity';
      let query = this.userRepository.createQueryBuilder('user');

      query = query.leftJoinAndSelect(
        'user.lastActivity',
        'last_activity',
        'user.id = last_activity.userId',
      );

      if (dataTableOptions.filterBy) {
        if (dataTableOptions.filterBy === 'user') {
          query = query.where(
            `LOWER(user.name) LIKE '%' || :filterValue || '%'`,
            { filterValue: dataTableOptions.filterValue.toLowerCase() },
          );
        }
      }

      if (dataTableOptions.sortBy === 'lastActivityTime') {
        dataTableOptions.sortBy = 'lastActivityTime';
      }

      if (dataTableOptions.sortBy === 'user') {
        entity = 'user';
        dataTableOptions.sortBy = 'name';
      }

      const skip = dataTableOptions.pageSize * dataTableOptions.pageIndex || 0;

      return await query
        .skip(skip)
        .take(dataTableOptions.pageSize)
        .orderBy(
          `${entity}.${dataTableOptions.sortBy}`,
          dataTableOptions.sortOrder,
          'NULLS LAST',
        )
        .getManyAndCount();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  constructUserActivity(
    lastActivityDB: User[],
    lastActivityCache: streamStatusType[],
    userConnections: userConnectionType[],
  ) {
    // also get last activity to db
    // compare it with status from cache, if user not found in cache, use last activity from db

    let clientKeyMessage: string;

    const activity = lastActivityDB.map((db): streamStatusType => {
      const matchCached = lastActivityCache.find(
        (cache) => db.name === cache.name,
      );

      if (matchCached) {
        clientKeyMessage =
          matchCached.clientKey == db.lastActivity.clientKey
            ? 'match client key'
            : 'different client key';
      } else {
        clientKeyMessage = 'no client key was provided by the client';
      }

      return {
        // TODO: refactor this
        name: db.name,
        userStatus: userConnections.find(
          (userCon) => userCon.user === db.username,
        )
          ? 'online'
          : 'offline',
        status: matchCached ? matchCached.status : 'offline',
        playlistName: matchCached
          ? matchCached.playlistName ||
            'no playlist name provided by the client'
          : 'no playlist name provided by the client',
        volume: matchCached
          ? matchCached.volume || 'no volume provided by the client'
          : 'no volume provided by the client',
        trackName: matchCached
          ? matchCached.trackName || 'no track name provided by the client'
          : 'no track name provided by the client',
        album: matchCached
          ? matchCached.album || 'no track album provided by the client'
          : 'no track album provided by the client',
        artist: matchCached
          ? matchCached.artist || 'no track artist provided by the client'
          : 'no track artist provided by the client',
        lastActivityTime: db.lastActivity
          ? dayjs(db.lastActivity.lastActivityTime).format()
          : 'no last activity time',
        savedClientKey: db.lastActivity ? db.lastActivity.clientKey : null,
        clientKeyStatus: clientKeyMessage,
        clientKey: matchCached ? matchCached.clientKey : null,
        ...matchCached,
      };
    });

    return activity;
  }

  async getStreamStatus(
    dataTableOptions?: IDataTable,
    userStatus?: UserStatusEnum,
    ws?: boolean,
  ) {
    try {
      const key = StreamStatusKey();

      let lastActivityDB: any[];

      // get last activity from db
      if (dataTableOptions) {
        [lastActivityDB] = await this.getLastActivityFromDB(dataTableOptions);
      } else {
        lastActivityDB = await this.getAllLastActivityFromDB();
      }

      // return lastActivityDB;

      // get last activity from cache
      const lastActivityCache: streamStatusType[] =
        await this.redisCacheService.getStreamStatusCache(key);

      // get user status
      // get user status from cache
      const connections = await this.redisCacheService.getWebSocketConnections(
        `${CONNECTED_USER_PREF}`,
      );

      const userConnections = connections.map(
        (connection): userConnectionType => ({
          wsId: connection.id as string,
          user: connection.username as string,
        }),
      );

      let activity = this.constructUserActivity(
        lastActivityDB,
        lastActivityCache,
        userConnections,
      );

      // filter by stream status
      if (userStatus) {
        activity = activity.filter((act) => act.userStatus === userStatus);
      }

      // send event to trigger websocket
      if (ws) {
        this.eventEmitter.emit(UPDATE_STREAM_STATUS_EVENT_CONST, activity);
      }

      return [activity, activity.length];
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async updateStreamStatus(message: updateStreamStatusMessageType) {
    try {
      const lastActivity = dayjs().format();

      const user = await this.userService.findOneById(message.userId);

      if (!user) {
        return;
      }

      const streamStatus: streamStatusType = {
        name: user.name,
        status: message.status,
        playlistName: message.playlistName,
        trackName: message.trackName,
        album: message.album,
        artist: message.artist,
        lastActivityTime: lastActivity,
        clientKey: message.clientKey,
        volume: message.volume,
      };

      const key = StreamStatusKey(user.username);

      // process data to redis and db
      await this.redisCacheService.set(key, streamStatus, +STREAM_STATUS_TIME);
      await this.updateLastActivityDB({
        lastActivityTime: new Date(lastActivity),
        userId: user.id,
        clientKey: message.clientKey,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
