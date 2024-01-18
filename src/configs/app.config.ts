import { registerAs } from '@nestjs/config';

export const appConfiguration = registerAs('app', () => ({
  // nodeEnv: process.env.NODE_ENV,
  port: +process.env.APP_PORT,
}));
