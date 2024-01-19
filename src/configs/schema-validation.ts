import * as Joi from 'joi';

export const schemaValidation = Joi.object({
  // APP Configuration
  APP_PORT: Joi.string().required().default(3000),
  APP_FRONT_END_DOMAIN: Joi.string().required(),
  APP_TRACK_UPLOAD_LIMIT: Joi.number().required().default(10),

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
});
