import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignInDto, SignUpDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { appConfiguration } from '../configs';
import { ConfigType } from '@nestjs/config';
import { KEY_REFRESH_TOKEN_COOKIE } from './const';
import { AuthorizedUserType, tokenPayload } from './types';
import { TokenService } from '../token/token.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(appConfiguration.KEY)
    private appConfig: ConfigType<typeof appConfiguration>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  async signIn(payload: SignInDto) {
    try {
      const valid = await this.validateUser(payload.username, payload.password);

      if (!valid) {
        throw new UnauthorizedException('Invalid username or password');
      }

      // return access token and refresh token
      const tokens = await this.generateTokens(valid.id, valid.username);
      // save token
      await this.tokenService.create(tokens.refreshToken, valid.id, tokens.tf);

      return {
        username: valid.username,
        roles: valid.roles,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async signUp(payload: SignUpDto) {
    try {
      if (!payload.roles.length) {
        throw new BadRequestException('roles should not be empty');
      }

      const user = await this.userService.create(
        payload.username,
        payload.name,
        payload.password,
        payload.roles,
      );

      // access token and refresh token
      return user;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async signOut(user: AuthorizedUserType) {
    try {
      await this.tokenService.deleteRefreshTokenByTokenFamily(user.tf);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async validateUser(username: string, password: string) {
    try {
      // validate username and password
      const user = await this.userService.findOneByUsername(username);
      const validatePass = await user.validatePassword(password);
      if (user && validatePass) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;

        return result;
      }

      return null;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async generateTokens(
    id: string,
    username: string,
    tf?: string,
  ): Promise<{ accessToken: string; refreshToken: string; tf: string }> {
    // find latest data for user
    const user = await this.userService.findOneById(id);
    const roles = user.roles.map((role) => role.code);

    let payload: tokenPayload;
    if (tf) {
      payload = {
        sub: id,
        username: user.username,
        roles: roles,
        tf,
      };
    } else {
      const tf = uuid();
      payload = {
        sub: id,
        username: user.username,
        roles: roles,
        tf,
      };
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.appConfig.accessTokenSecret,
        expiresIn: `${this.appConfig.accessTokenExpiration}m`,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.appConfig.refreshTokenSecret,
        expiresIn: `${this.appConfig.refreshTokenExpiration}m`,
      }),
    ]);

    // invalidate token in database if token we expired
    await this.tokenService.invalidateToken();

    return {
      accessToken,
      refreshToken,
      tf: payload.tf,
    };
  }
  async validateAccessToken(token: tokenPayload): Promise<boolean> {
    try {
      const user = await this.userService.findOneByUsername(token.username);

      if (!user) {
        return false;
      }

      return true;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async validateRefreshToken(userId: string, token: string) {
    try {
      // verify if user id in token if valid user id
      const user = await this.userService.findOneById(userId);

      // user id invalid
      if (!user) {
        return false;
      }

      // user valid
      // validate token for this user
      const oldToken = await this.tokenService.findOneByToken(token);

      // token invalid
      if (!oldToken) {
        return false;
      }

      // user id valid and token valid
      return true;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async generateNewRefreshToken(authorizedUser: AuthorizedUserType) {
    try {
      // get user data
      const user = await this.userService.findOneById(authorizedUser.id);
      const tokens = await this.generateTokens(
        user.id,
        user.username,
        authorizedUser.tf,
      );

      // save new token
      await this.tokenService.create(
        tokens.refreshToken,
        user.id,
        authorizedUser.tf,
      );

      return {
        username: user.username,
        roles: user.roles,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  generateRefreshTokenCookie(rt: string): {
    key: string;
    refreshToken: string;
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'none' | 'lax' | 'strict';
      expires: Date;
      domain: string;
    };
  } {
    return {
      key: KEY_REFRESH_TOKEN_COOKIE,
      refreshToken: rt,
      options: {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(
          Date.now() + +this.appConfig.refreshTokenExpiration * 60 * 1000,
        ),
        domain: this.appConfig.appCookieDomain,
      },
    };
  }
}
