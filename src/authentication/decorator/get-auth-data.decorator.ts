import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthorizedUserType, tokenPayload } from '../types';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const GetAuthorizedUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthorizedUserType => {
    const request = context.switchToHttp().getRequest();
    const auth = request.user as tokenPayload;
    return {
      id: auth.sub,
      username: auth.username,
      roles: auth.roles,
      tf: auth.tf,
    };
  },
);
