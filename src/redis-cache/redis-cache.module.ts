import { Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     store: redisStore,
    //     url: `${configService.get<string>('REDIS_URL')}?family=0`,
    //     // host: configService.get<string>('REDIS_HOST'),
    //     // port: configService.get<number>('REDIS_PORT'),
    //     ttl: configService.get<number>('REDIS_TTL'),
    //     // password: configService.get<string>('REDIS_PASSWORD'),
    //   }),
    //   isGlobal: true,
    // }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'single',
        url: `${configService.get<string>('REDIS_URL')}?family=0`,
      }),
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
