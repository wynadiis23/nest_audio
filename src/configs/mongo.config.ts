import { registerAs } from '@nestjs/config';

export const mongoConfiguration = registerAs('mongoConfig', () => ({
  url: process.env.LOG_MONGO_URI,
}));
