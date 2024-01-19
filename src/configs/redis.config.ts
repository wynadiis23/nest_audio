import { registerAs } from '@nestjs/config';

export const redisConfiguration = registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  ttl: process.env.REDIS_TTL,
}));
