import { registerAs } from '@nestjs/config';

export const appConfiguration = registerAs('app', () => ({
  // nodeEnv: process.env.NODE_ENV,
  port: +process.env.APP_PORT,
  appFrontendDomain: process.env.APP_FRONT_END_DOMAIN,
  appTrackUploadLimit: +process.env.APP_TRACK_UPLOAD_LIMIT,
  accessTokenSecret: process.env.APP_ACCESS_TOKEN_SECRET,
  accessTokenExpiration: process.env.APP_ACCESS_TOKEN_EXP,
  refreshTokenSecret: process.env.APP_REFRESH_TOKEN_SECRET,
  refreshTokenExpiration: process.env.APP_REFRESH_TOKEN_EXP,
  appCookieDomain: process.env.APP_COOKIE_DOMAIN,
  appTrackFolder: process.env.APP_TRACK_FOLDER,

  google: {
    clientID: process.env.OAUTH_GOOGLE_ID,
    clientSecret: process.env.OAUTH_GOOGLE_SECRET,
    callbackURL: process.env.OAUTH_GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email'],
  },
}));
