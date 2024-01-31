import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class StreamStatusConfigService {
  constructor(
    private configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  isValidAuthHeader(authorization: string, client?: Socket) {
    try {
      if (!authorization) {
        throw new WsException('no token was provided');
      }

      const token = authorization;
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('APP_ACCESS_TOKEN_SECRET'),
        ignoreExpiration: false,
      });

      if (client) {
        client.handshake.auth.payload = payload;

        return client;
      }

      return payload;
    } catch (error) {
      console.log(error);
      throw new WsException(error.message);
    }
  }
}
