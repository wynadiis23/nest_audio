import {
  BadRequestException,
  HttpStatus,
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
import { AuthorizedUserType, googleOAuthType, tokenPayload } from './types';
import { TokenService } from '../token/token.service';
import { v4 as uuid } from 'uuid';
import { RoleEnum } from '../user-role/enum';
import { User } from '../user/entity/user.entity';
import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

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
        payload.email,
        payload.password,
        payload.roles,
        payload.oauthProvider,
        payload.oauthId,
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

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.oauthId) {
        throw new UnauthorizedException(
          'User was registered with OAuth. Please login using available OAuth provider',
        );
      }

      const validatePass = await user.validatePassword(password);
      if (user && validatePass) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;

        return result;
      }

      return null;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async generateTokens(
    id: string,
    username: string,
    tf?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    tf: string;
    userData: {
      username: string;
      name: string;
      roles: string[];
      clientKey: string;
    };
  }> {
    let tokenFamily: string;
    // find latest data for user
    const user = await this.userService.findOneById(id);
    const clientKey = user?.lastActivity?.clientKey || null;
    const roles = user.roles.map((role) => role.code);

    let payload: tokenPayload;
    if (tf) {
      tokenFamily = tf;
      payload = {
        sub: id,
        username: user.username,
        roles: roles,
        tf: tokenFamily,
        clientKey,
      };
    } else {
      const tf = uuid();
      tokenFamily = tf;
      payload = {
        sub: id,
        username: user.username,
        roles: roles,
        tf: tokenFamily,
        clientKey,
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

    // save token
    await this.tokenService.create(refreshToken, id, tokenFamily);

    const userData: {
      username: string;
      name: string;
      roles: string[];
      clientKey: string;
    } = {
      username: user.username,
      name: user.name,
      roles: roles,
      clientKey,
    };

    return {
      accessToken,
      refreshToken,
      tf: payload.tf,
      userData,
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
      // const user = await this.userService.findOneById(authorizedUser.id);
      const tokens = await this.generateTokens(
        authorizedUser.id,
        authorizedUser.username,
        authorizedUser.tf,
      );

      return {
        username: tokens.userData.username,
        roles: tokens.userData.roles,
        clientKey: tokens.userData.clientKey,
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

  async googleOAuth(googleOAuthPayload: googleOAuthType, res: Response) {
    try {
      let user: User;
      // check if email was registere or not
      // if not register the user (SIGN UP)
      // if yes generate token (SIGN IN)

      user = await this.userService.findOneByEmail(googleOAuthPayload.email);

      if (!user) {
        user = await this.signUp({
          email: googleOAuthPayload.email,
          name: googleOAuthPayload.email,
          username: googleOAuthPayload.email,
          roles: [RoleEnum.GENERAL],
          password: null,
          oauthId: googleOAuthPayload.providerId,
          oauthProvider: googleOAuthPayload.provider,
        });

        console.log('sign up');
      }

      const tokens = await this.generateTokens(user.id, user.username);
      // save token
      await this.tokenService.create(tokens.refreshToken, user.id, tokens.tf);

      const payload = {
        username: user.username,
        roles: user.roles.map((role) => role.code),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };

      const generatedCookie = this.generateRefreshTokenCookie(
        tokens.refreshToken,
      );
      res.cookie(
        generatedCookie.key,
        generatedCookie.refreshToken,
        generatedCookie.options,
      );

      res.status(HttpStatus.OK).json({
        message: 'sign in data authenticated',
        data: payload,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async googleOAuthFrontEnd(token: string, res: Response) {
    try {
      const client = new OAuth2Client({
        clientId: this.appConfig.google.clientID,
        clientSecret: this.appConfig.google.clientSecret,
      });
      console.log(token);

      const ticket = await client.getTokenInfo(token);

      // validate email domain
      const emailDomain = ticket.email
        .substring(ticket.email.indexOf('@'), ticket.email.length)
        .toLocaleLowerCase();

      console.log(emailDomain);

      if (emailDomain !== '@planetsurf.id') {
        throw new UnauthorizedException('invalid email domain');
      }

      let user: User;
      // check if email was registere or not
      // if not register the user (SIGN UP)
      // if yes generate token (SIGN IN)

      user = await this.userService.findOneByEmail(ticket.email);

      if (!user) {
        user = await this.signUp({
          email: ticket.email,
          name: ticket.email,
          username: ticket.email,
          roles: [RoleEnum.GENERAL],
          password: null,
          oauthId: null,
          oauthProvider: 'google',
        });

        console.log('sign up');
      }

      const tokens = await this.generateTokens(user.id, user.username);
      // save token
      await this.tokenService.create(tokens.refreshToken, user.id, tokens.tf);

      const payload = {
        username: user.username,
        roles: user.roles.map((role) => role.code),
        accessToken: tokens.accessToken,
      };

      const generatedCookie = this.generateRefreshTokenCookie(
        tokens.refreshToken,
      );

      res.cookie(
        generatedCookie.key,
        generatedCookie.refreshToken,
        generatedCookie.options,
      );

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
