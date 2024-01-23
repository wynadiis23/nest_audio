import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { KEY_REFRESH_TOKEN_COOKIE } from '../const';
import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { tokenPayload } from '../types';
import { TokenService } from '../../token/token.service';
import { AuthenticationService } from '../authentication.service';
import { appConfiguration } from '../../configs';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh_token',
) {
  constructor(
    @Inject(appConfiguration.KEY)
    private appConfig: ConfigType<typeof appConfiguration>,
    private readonly tokenService: TokenService,
    private readonly authenticationService: AuthenticationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          console.log(req);
          const data = req?.cookies[KEY_REFRESH_TOKEN_COOKIE];

          if (!data) {
            throw new UnauthorizedException();
          }

          return data;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: appConfig.refreshTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, token: tokenPayload): Promise<tokenPayload> {
    const cookieToken = request.cookies[KEY_REFRESH_TOKEN_COOKIE];

    request.res.clearCookie(KEY_REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      domain: this.appConfig.appCookieDomain,
    });

    const tokenFound = await this.tokenService.findOneByToken(cookieToken);

    if (!tokenFound) {
      throw new ForbiddenException();
    }

    const valid = await this.authenticationService.validateRefreshToken(
      token.sub,
      cookieToken,
    );

    if (!valid) {
      throw new UnauthorizedException();
    }

    // delete old refresh token
    await this.tokenService.deleteRefreshToken(cookieToken);

    return token;
  }
}
