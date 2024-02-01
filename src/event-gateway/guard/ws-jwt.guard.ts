import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { EventGatewayConfigService } from '../event-gateway-config/event-gateway-config.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private eventGatewayConfigService: EventGatewayConfigService) {}
  canActivate(context: ExecutionContext): any {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client = context.switchToWs().getClient<Socket>();
    const authorization =
      client.handshake.auth?.token || client.handshake.headers?.token;

    const payload = this.eventGatewayConfigService.isValidAuthHeader(
      authorization,
      client,
    );

    return payload;
  }
}
