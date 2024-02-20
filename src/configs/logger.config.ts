import { registerAs } from '@nestjs/config';

export const loggerConfiguration = registerAs('loggerConfig', () => ({
  logger_mongo: process.env.LOG_MONGO === 'true',
  mongo_coll: process.env.LOG_MONGO_COLLECTION as string,
  mongo_uri: process.env.LOG_MONGO_URI as string,
}));
