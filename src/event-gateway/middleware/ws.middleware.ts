import { Socket } from 'socket.io';
import { EventGatewayConfigService } from '../event-gateway-config/event-gateway-config.service';
import { UnauthorizedException } from '@nestjs/common';

export type SocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => void;
export const WSAuthMiddleware = (
  eventGatewayConfigService: EventGatewayConfigService,
): SocketMiddleware => {
  return async (client: Socket, next) => {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.token;
      const user = eventGatewayConfigService.isValidAuthHeader(token);
      if (user) {
        client.handshake.auth.user = user;
        next();
      } else {
        next({
          name: 'Unauthorized',
          message: 'Unauthorized',
        });
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        next({
          name: 'Unauthorized',
          message: 'Unauthorized',
        });
      } else {
        next({ name: error.name, message: error.message });
      }
    }
  };
};
