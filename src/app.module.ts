import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TracksModule } from './tracks/tracks.module';
import {
  appConfiguration,
  dsConfiguration,
  loggerConfiguration,
  mongoConfiguration,
  redisConfiguration,
  schemaValidation,
} from './configs';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { PlaylistModule } from './playlist/playlist.module';
import { PlaylistContentModule } from './playlist-content/playlist-content.module';
import { StreamStatusModule } from './stream-status/stream-status.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import {
  EmailExistsValidation,
  IsNotExist,
  PlaylistExistsValidation,
  UserExistsValidation,
} from './common/validator';
import { TokenModule } from './token/token.module';
import {
  JwtRefreshTokenStrategy,
  JwtStrategy,
  LocalStrategy,
} from './authentication/strategy';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenAuthGuard } from './authentication/guard';
import { TracksMetadataModule } from './tracks-metadata/tracks-metadata.module';
import { UserPlaylistModule } from './user-playlist/user-playlist.module';
import { EventGatewayModule } from './event-gateway/event-gateway.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { GoogleOAuthStrategy } from './authentication/strategy/google-oauth.strategy';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { pino, TransportTargetOptions } from 'pino';
import { KEY_REFRESH_TOKEN_COOKIE } from './authentication/const';
import { tokenPayload } from './authentication/types';
import { Request } from 'express';
import { PlaylistImageModule } from './playlist-image/playlist-image.module';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from './logger/logger.module';
import { MongooseConfigService } from './database/mongoose-config.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { PromMetricsController } from './prom-metrics/prom-metrics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `${process.cwd()}/src/configs/env/.env.ds`,
        `${process.cwd()}/src/configs/env/.env.app`,
        `${process.cwd()}/src/configs/env/.env.redis`,
      ],
      load: [
        dsConfiguration,
        appConfiguration,
        redisConfiguration,
        loggerConfiguration,
        mongoConfiguration,
      ],
      validationSchema: schemaValidation,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..'),
    // }),
    PrometheusModule.register({
      defaultLabels: {
        app: 'NESTJS-AUDIO',
      },
      controller: PromMetricsController,
    }),
    PinoLoggerModule.forRootAsync({
      inject: [loggerConfiguration.KEY, appConfiguration.KEY],
      useFactory: async (
        conf: ConfigType<typeof loggerConfiguration>,
        appConf: ConfigType<typeof appConfiguration>,
      ) => {
        return {
          pinoHttp: {
            serializers: {
              req: (req) => {
                let username: string | undefined;

                // find username in rt
                const rtCookie: string | undefined = req?.headers.cookie
                  ?.split(';')
                  .find((c: string) => c.startsWith(KEY_REFRESH_TOKEN_COOKIE));

                if (!username && rtCookie) {
                  const rt = rtCookie.split('=')[1];
                  try {
                    const claims = rt.split('.')[1];
                    const parsed = JSON.parse(
                      Buffer.from(claims, 'base64').toString('utf-8'),
                    ) as tokenPayload;
                    username = parsed.username;
                  } catch (error) {}
                }

                // fallback to use access token
                const accessToken: string | undefined =
                  req?.headers.authorization;
                if (!username && accessToken) {
                  try {
                    const claims = accessToken.split('.')[1];
                    const parsed = JSON.parse(
                      Buffer.from(claims, 'base64').toString('utf-8'),
                    ) as tokenPayload;
                    username = parsed.username;
                  } catch (error) {}
                }

                // Fallback to handling individual cases
                const res = {
                  ...req,
                  _added: {
                    username,
                  },
                  headers: {
                    ...req.headers,
                    authorization: req.headers.authorization
                      ? '[REDACTED]'
                      : undefined,
                    cookie: req.headers.cookie ? '[REDACTED]' : undefined,
                  },
                } satisfies Request;

                return res;
              },
            },
            logger: pino(
              {
                level: 'trace',
                redact: {
                  paths: [`res.headers['set-cookie']`],
                  censor: '[REDACTED]',
                },
              },
              pino.transport({
                targets: [
                  ...(appConf.nodeEnv === 'development'
                    ? [
                        {
                          target: 'pino-pretty',
                          level: 'trace',
                          options: {
                            colorize: true,
                          },
                        } satisfies TransportTargetOptions,
                      ]
                    : []),

                  // ...(conf.logger_mongo
                  //   ? [
                  //       {
                  //         target: 'pino-mongodb',
                  //         level: 'trace',
                  //         options: {
                  //           uri: conf.mongo_uri,
                  //           collection: conf.mongo_coll,
                  //         },
                  //       } satisfies TransportTargetOptions,
                  //     ]
                  //   : []),

                  ...(conf.logger_loki
                    ? [
                        {
                          target: 'pino-loki',
                          options: {
                            labels: { application: 'NESTJS-AUDIO' },
                            batching: true,
                            interval: 5,
                            host: conf.logger_loki_url,
                          },
                        } satisfies TransportTargetOptions,
                      ]
                    : []),
                ],
              }),
            ),
          },
        };
      },
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
    UserPlaylistModule,
    EventGatewayModule,
    PlaylistImageModule,
    LoggerModule,
  ],
  controllers: [AppController, PromMetricsController],
  providers: [
    AppService,
    IsNotExist,
    UserExistsValidation,
    PlaylistExistsValidation,
    EmailExistsValidation,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    GoogleOAuthStrategy,
    {
      // Use AccessTokenAuthGuard as global guard
      provide: APP_GUARD,
      useClass: AccessTokenAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
