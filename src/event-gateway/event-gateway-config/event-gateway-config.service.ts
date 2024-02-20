import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class EventGatewayConfigService {
  constructor(
    private configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  isValidAuthHeader(authorization: string, client?: Socket) {
    try {
      if (!authorization) {
        throw new JsonWebTokenError('no token was provided');
      }

      const token = authorization.split(' ');
      const user = this.jwtService.verify(token[1], {
        secret: this.configService.get<string>('APP_ACCESS_TOKEN_SECRET'),
        ignoreExpiration: false,
      });

      if (client) {
        client.handshake.auth.user = user;

        return client;
      }

      return user;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(error.message);
      }
      throw new WsException(error.message);
    }
  }
}
