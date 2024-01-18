import * as Joi from 'joi';

export const schemaValidation = Joi.object({
  // APP Configuration
  APP_PORT: Joi.string().required().default(3000),

  // Database Configuration
  DS_HOST: Joi.string().required(),
  DS_PORT: Joi.number().default(5432),
  DS_USERNAME: Joi.string().required(),
  DS_PASSWORD: Joi.string().required(),
  DS_NAME: Joi.string().required(),
  DS_SYNCHRONIZE: Joi.boolean().default(false),
});
