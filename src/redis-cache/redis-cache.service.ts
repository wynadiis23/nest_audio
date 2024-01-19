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

  async set(key: string, value: any) {
    try {
      return await this.cache.set(key, value);
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
}
