import { JwtAuthGuard } from './../../auth/guard/jwt.guard';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { PermissionRole } from '../enum/common.enum';
import { RolesGuard } from '../guard/role.guard';

export function RoleGuard(...roles: PermissionRole[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    // UseGuards(RolesGuard),
    Roles(roles),
  );
}

export const Roles = (roles: PermissionRole[]) => SetMetadata('roles', roles);
