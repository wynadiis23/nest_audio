import {
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

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(appConfiguration.KEY)
    private appConfig: ConfigType<typeof appConfiguration>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(payload: SignInDto) {
    try {
      const valid = await this.validateUser(payload.username, payload.password);

      if (!valid) {
        throw new UnauthorizedException('Invalid username or password');
      }

      // return access token and refresh token
      const tokens = await this.generateTokens(valid.username);

      return {
        username: valid.username,
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
      const user = await this.userService.create(
        payload.username,
        payload.password,
      );

      // access token and refresh token
      return user;
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
    username: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      username: username,
    };

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

    return {
      accessToken,
      refreshToken,
    };
  }
}
