import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  AdminRequest,
  AuthTokenPayload,
} from '../types/auth-token-payload';

@Injectable()
export class AdminJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não informado.');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload =
        await this.jwtService.verifyAsync<AuthTokenPayload>(token);

      if (payload.role !== 'admin') {
        throw new UnauthorizedException('Acesso apenas para administradores.');
      }

      request.admin = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
