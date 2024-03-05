import { registerAs } from '@nestjs/config';

export const loggerConfiguration = registerAs('loggerConfig', () => ({
  logger_loki: process.env.LOG_LOKI === 'true',
  logger_loki_url: process.env.LOG_LOKI_URL,
  logger_mongo: process.env.LOG_MONGO === 'true',
  mongo_coll: process.env.LOG_MONGO_COLLECTION as string,
  mongo_uri: process.env.LOG_MONGO_URI as string,
}));
