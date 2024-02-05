import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Socket } from 'socket.io';

export const WSAuthorization = createParamDecorator((_, request: any) => {
  try {
    const executionContext: ExecutionContext = request;
    const client = executionContext.switchToWs().getClient<Socket>();
    return client.handshake.auth.user;
  } catch (error) {
    throw new Error(error);
  }
});
