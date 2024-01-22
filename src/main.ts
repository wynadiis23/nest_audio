import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { useContainer } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const APP_FRONTEND_DOMAIN = configService.get('APP_FRONT_END_DOMAIN');

  const whitelistDomain =
    APP_FRONTEND_DOMAIN == '*' ? '*' : APP_FRONTEND_DOMAIN.split(',');

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors({
    origin: whitelistDomain,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true, // TODO: set => credentials: 'include' or withCredentials: true in the client's request header
  });

  app.use(bodyParser.urlencoded({ limit: '2gb', extended: true }));
  app.use(bodyParser.json({ limit: '2gb' }));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.get<number>('APP_PORT'));
}
bootstrap();
