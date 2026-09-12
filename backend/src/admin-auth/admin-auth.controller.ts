import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminJwtAuthGuard } from '../common/guards/admin-jwt-auth.guard';
import type { AuthTokenPayload } from '../common/types/auth-token-payload';

@Controller('admin-auth')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() data: AdminLoginDto) {
    return this.adminAuthService.login(data);
  }

  @Get('me')
  @UseGuards(AdminJwtAuthGuard)
  async me(@Headers('authorization') authorization?: string) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não informado.');
    }

    const token = authorization.replace('Bearer ', '');
    const payload = await this.jwtService.verifyAsync<AuthTokenPayload>(token);

    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    return this.adminAuthService.getProfile(payload.sub);
  }
}
