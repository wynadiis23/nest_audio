import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { HttpExceptionFilter } from './common/exception/http-filter.exception';
import helmet from 'helmet';
import { LoggerInterceptor } from './common/interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  const APP_FRONTEND_DOMAIN = configService.get('APP_FRONT_END_DOMAIN');

  const whitelistDomain =
    APP_FRONTEND_DOMAIN == '*' ? '*' : APP_FRONTEND_DOMAIN.split(',');

  app.use(cookieParser());

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapterHost));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors({
    origin: whitelistDomain,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true, // TODO: set => credentials: 'include' or withCredentials: true in the client's request header
  });

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Public Folder
  app.use('/public', express.static(join(__dirname, '..', 'public')));

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new LoggerInterceptor(),
  );

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // swagger first then helmet
  // for swagger access in local network without domain
  app.use(helmet({ crossOriginResourcePolicy: false }));

  await app.listen(configService.get<number>('APP_PORT'));
}
bootstrap();
