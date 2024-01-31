import { Socket } from 'socket.io';
import { StreamStatusConfigService } from '../stream-status-config/stream-status-config.service';

export type SocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => void;
export const WSAuthMiddleware = (
  streamStatusConfigService: StreamStatusConfigService,
): SocketMiddleware => {
  return async (client: Socket, next) => {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.token;
      const payload = await streamStatusConfigService.isValidAuthHeader(token);
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
