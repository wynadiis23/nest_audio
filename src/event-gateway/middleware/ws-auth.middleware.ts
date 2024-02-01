import { Socket } from 'socket.io';
import { EventGatewayConfigService } from '../event-gateway-config/event-gateway-config.service';

type SocketIOMiddleWare = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (
  eventGatewayConfigService: EventGatewayConfigService,
): SocketIOMiddleWare => {
  return (client, next) => {
    try {
      const authorization =
        client.handshake.auth.token || client.handshake.headers.token;

      const payload =
        eventGatewayConfigService.isValidAuthHeader(authorization);
      client.handshake.auth.payload = payload;
      next();
    } catch (error) {
      next(error);
    }
  };
};
