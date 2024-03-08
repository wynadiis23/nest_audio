import * as Joi from 'joi';

export const schemaValidation = Joi.object({
  // APP Configuration
  NODE_ENV: Joi.string().required(),

  APP_PORT: Joi.string().required().default(3000),
  APP_FRONT_END_DOMAIN: Joi.string().required(),
  APP_TRACK_UPLOAD_LIMIT: Joi.number().required().default(10),
  APP_TRACK_MINIMUM_BIT_RATE: Joi.number().required(),
  APP_ACCESS_TOKEN_SECRET: Joi.string().required(),
  APP_ACCESS_TOKEN_EXP: Joi.number().required(),
  APP_REFRESH_TOKEN_SECRET: Joi.string().required(),
  APP_REFRESH_TOKEN_EXP: Joi.number().required(),
  APP_COOKIE_DOMAIN: Joi.string().required(),
  APP_TRACK_FOLDER: Joi.string().required(),

  // OAuth
  OAUTH_GOOGLE_ID: Joi.string().required(),
  OAUTH_GOOGLE_SECRET: Joi.string().required(),
  OAUTH_GOOGLE_CALLBACK_URL: Joi.string().required(),

  // Logger
  LOG_MONGO: Joi.boolean().required(),
  LOG_MONGO_COLLECTION: Joi.string().required(),
  LOG_MONGO_URI: Joi.string().required(),
  LOG_LOKI: Joi.boolean().required(),
  LOG_LOKI_URL: Joi.string().required(),

  // Database Configuration
  DS_HOST: Joi.string().required(),
  DS_PORT: Joi.number().default(5432),
  DS_USERNAME: Joi.string().required(),
  DS_PASSWORD: Joi.string().required(),
  DS_NAME: Joi.string().required(),
  DS_SYNCHRONIZE: Joi.boolean().default(false),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_TTL: Joi.number().default(360),
  REDIS_URL: Joi.string().required(),
});
