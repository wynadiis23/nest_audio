import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CONNECTED_USER_PREF } from '../event-gateway/const';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisCacheService {
  constructor(
    // @Inject(CACHE_MANAGER)
    // private readonly cache: Cache,
    @InjectRedis() private readonly cache: Redis,
  ) {}

  async set(key: string, value: any, ttl?: number) {
    try {
      return await this.cache.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async unset(key: string) {
    try {
      return await this.cache.del(key);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async unsetWebSocket(key: string) {
    try {
      // websocket delete connected user after disconnected
      let data: { id: string; username: string };

      const connectedUserKeys = await this.cache.keys(
        `${CONNECTED_USER_PREF}*`,
      );

      for (const connectedUserKey of connectedUserKeys) {
        data = JSON.parse(await this.cache.get(connectedUserKey));

        if (data.id === key) {
          await this.unset(connectedUserKey);

          break;
        }
      }

      return data;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // used for get stream status and get connected websocket user
  async getStreamStatusCache(key: string) {
    try {
      const cachedStatus = [];
      const keys: string[] = await this.cache.keys(`${key}*`);

      for (const key of keys) {
        const cached = JSON.parse(await this.cache.get(key));
        cachedStatus.push(cached);
      }

      return cachedStatus;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // get stored web socket connection
  async getWebSocketConnections(key: string) {
    try {
      const connections = [];
      const keys: string[] = await this.cache.keys(`${key}*`);

      for (const key of keys) {
        const connection = JSON.parse(await this.cache.get(key));
        connections.push(connection);
      }

      return connections;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
