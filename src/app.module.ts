import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TracksModule } from './tracks/tracks.module';
import {
  appConfiguration,
  dsConfiguration,
  redisConfiguration,
  schemaValidation,
} from './configs';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PlaylistModule } from './playlist/playlist.module';
import { PlaylistContentModule } from './playlist-content/playlist-content.module';
import { StreamStatusModule } from './stream-status/stream-status.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UploadProgressMiddleware } from './common/middleware/upload-progress.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `${process.cwd()}/src/configs/env/.env.ds`,
        `${process.cwd()}/src/configs/env/.env.app`,
        `${process.cwd()}/src/configs/env/.env.redis`,
      ],
      load: [dsConfiguration, appConfiguration, redisConfiguration],
      validationSchema: schemaValidation,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
    }),
    EventEmitterModule.forRoot(),
    TracksModule,
    PlaylistModule,
    PlaylistContentModule,
    StreamStatusModule,
    RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UploadProgressMiddleware)
      .forRoutes({ path: 'tracks', method: RequestMethod.POST });
  }
}
