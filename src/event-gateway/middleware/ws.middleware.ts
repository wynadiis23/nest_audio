import { Socket } from 'socket.io';
import { EventGatewayConfigService } from '../event-gateway-config/event-gateway-config.service';

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
      const payload = await eventGatewayConfigService.isValidAuthHeader(token);
      if (payload) {
        client.handshake.auth.payload = payload;
        next();
      } else {
        next({
          name: 'Unauthorized',
          message: 'Unauthorized',
        });
      }
    } catch (error) {
      next({
        name: 'Unauthorized',
        message: 'Unauthorized',
      });
    }
  };
};
