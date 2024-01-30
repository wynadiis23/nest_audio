import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { StreamStatusConfigService } from '../stream-status-config/stream-status-config.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private streamStatusConfigService: StreamStatusConfigService) {}
  canActivate(context: ExecutionContext): any {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client = context.switchToWs().getClient<Socket>();
    const authorization =
      client.handshake.auth?.token || client.handshake.headers?.token;

    const payload =
      this.streamStatusConfigService.isValidAuthHeader(authorization);

    return payload;
  }
}
