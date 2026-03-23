import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(data: AdminLoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: data.email },
    });

    if (!admin) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const passwordMatches = await bcrypt.compare(data.password, admin.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const token = await this.generateToken(admin.id, admin.email);

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      accessToken: token,
    };
  }

  async getProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin não encontrado.');
    }

    return admin;
  }

  private async generateToken(adminId: string, email: string) {
    return this.jwtService.signAsync({
      sub: adminId,
      email,
      role: 'admin',
    });
  }
}