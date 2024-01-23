import { Module } from '@nestjs/common';
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
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { IsNotExist } from './common/validator';
import { TokenModule } from './token/token.module';
import {
  JwtRefreshTokenStrategy,
  JwtStrategy,
  LocalStrategy,
} from './authentication/strategy';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenAuthGuard } from './authentication/guard';
import { TracksMetadataModule } from './tracks-metadata/tracks-metadata.module';

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
    AuthenticationModule,
    UserModule,
    TokenModule,
    TracksMetadataModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    IsNotExist,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    {
      // Use AccessTokenAuthGuard as global guard
      provide: APP_GUARD,
      useClass: AccessTokenAuthGuard,
    },
  ],
})
export class AppModule {}
