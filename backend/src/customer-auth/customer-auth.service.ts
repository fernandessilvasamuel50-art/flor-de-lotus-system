import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterCustomerDto) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existingCustomer) {
      throw new BadRequestException(
        'Já existe um cliente cadastrado com esse email.',
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const customer = await this.prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
      },
    });

    const token = await this.generateToken(customer.id, customer.email ?? '');

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      accessToken: token,
    };
  }

  async login(data: LoginCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (!customer || !customer.password) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const passwordMatches = await bcrypt.compare(
      data.password,
      customer.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const token = await this.generateToken(customer.id, customer.email ?? '');

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      accessToken: token,
    };
  }

  async getProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!customer) {
      throw new UnauthorizedException('Cliente não encontrado.');
    }

    return customer;
  }

  async getDashboard(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!customer) {
      throw new UnauthorizedException('Cliente não encontrado.');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        customerId,
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: [{ appointmentDate: 'desc' }, { startTime: 'desc' }],
    });

    return {
      customer,
      appointments,
    };
  }

  async updateProfile(customerId: string, data: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new UnauthorizedException('Cliente não encontrado.');
    }

    if (data.email && data.email !== customer.email) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email: data.email },
      });

      if (existingCustomer && existingCustomer.id !== customerId) {
        throw new BadRequestException('Já existe um cliente com esse email.');
      }
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        name: data.name ?? customer.name,
        email: data.email ?? customer.email,
        phone: data.phone ?? customer.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return updatedCustomer;
  }

  private async generateToken(customerId: string, email: string) {
    return this.jwtService.signAsync({
      sub: customerId,
      email,
      role: 'customer',
    });
  }
}