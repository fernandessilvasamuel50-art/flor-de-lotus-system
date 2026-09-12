import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AdminRequest } from '../types/auth-token-payload';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AdminRequest>();

    if (!request.admin || request.admin.role !== 'admin') {
      throw new UnauthorizedException('Acesso apenas para administradores.');
    }

    return true;
  }
}
