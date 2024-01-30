import { Socket } from 'socket.io';
import { StreamStatusConfigService } from '../stream-status-config/stream-status-config.service';

type SocketIOMiddleWare = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (
  streamStatusConfigService: StreamStatusConfigService,
): SocketIOMiddleWare => {
  return (client, next) => {
    try {
      const authorization =
        client.handshake.auth.token || client.handshake.headers.token;

      streamStatusConfigService.isValidAuthHeader(authorization);
      next();
    } catch (error) {
      next(error);
    }
  };
};
