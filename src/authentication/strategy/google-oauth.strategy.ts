import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { appConfiguration } from '../../configs';
import { ConfigType } from '@nestjs/config';
import { googleOAuthType } from '../types';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(appConfiguration.KEY)
    appConfig: ConfigType<typeof appConfiguration>,
  ) {
    super({
      clientID: appConfig.google.clientID,
      clientSecret: appConfig.google.clientSecret,
      callbackURL: appConfig.google.callbackURL,
      scope: appConfig.google.scope,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, name, emails } = profile;

      const user: googleOAuthType = {
        provider: 'google',
        providerId: id,
        email: emails[0].value,
        name: `${name.givenName} ${name.familyName}`,
      };

      console.log(user);

      done(null, user);
    } catch (error) {
      console.log(error);
    }
  }
}
