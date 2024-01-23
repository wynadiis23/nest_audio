import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../../user-role/enum';

export const ROLES_KEY = 'roles';
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
// then add logic to check 'roles' into roles.guard.ts
