import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CONNECTED_USER_PREF } from '../event-gateway/const';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async set(key: string, value: any, ttl?: number) {
    try {
      return await this.cache.set(key, value, { ttl: ttl } as any);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async unset(key: string, ws?: boolean) {
    try {
      if (!ws) {
        return await this.cache.del(key);
      }

      // websocket delete connected user after disconnected
      let data: { id: string; username: string };

      const connectedUserKeys = await this.cache.store.keys(
        `${CONNECTED_USER_PREF}*`,
      );

      for (const connectedUserKey of connectedUserKeys) {
        data = await this.cache.get(connectedUserKey);

        if (data.id === key) {
          await this.cache.del(connectedUserKey);

          break;
        }
      }

      return;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // used for get stream status and get connected websocket user
  async getStreamStatusCache(key: string) {
    try {
      const cachedStatus = [];
      const keys: string[] = await this.cache.store.keys(`${key}*`);

      for (const key of keys) {
        const cached = await this.cache.get(key);
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
      const keys: string[] = await this.cache.store.keys(`${key}*`);

      for (const key of keys) {
        const connection = await this.cache.get(key);
        connections.push(connection);
      }

      return connections;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
