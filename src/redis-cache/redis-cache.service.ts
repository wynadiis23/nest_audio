import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

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

  async unset(key: string) {
    try {
      return await this.cache.del(key);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

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
