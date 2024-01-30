import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StreamStatusConfigService {
  constructor(
    private configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  isValidAuthHeader(authorization: string) {
    try {
      if (!authorization) {
        throw new UnauthorizedException();
      }

      const token: string = authorization.split(' ')[1];
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('APP_ACCESS_TOKEN_SECRET'),
        ignoreExpiration: false,
      });

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
