import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticationService } from '../authentication.service';
import { ConfigService } from '@nestjs/config';
import { tokenPayload } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'access_token') {
  constructor(
    private readonly authenticationService: AuthenticationService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('APP_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(token: tokenPayload): Promise<tokenPayload> {
    const valid = await this.authenticationService.validateAccessToken(token);

    if (!valid) {
      throw new UnauthorizedException();
    }

    return token;
  }
}
