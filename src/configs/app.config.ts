import { registerAs } from '@nestjs/config';

export const appConfiguration = registerAs('app', () => ({
  // nodeEnv: process.env.NODE_ENV,
  port: +process.env.APP_PORT,
  appFrontendDomain: process.env.APP_FRONT_END_DOMAIN,
  appTrackUploadLimit: +process.env.APP_TRACK_UPLOAD_LIMIT,
}));
