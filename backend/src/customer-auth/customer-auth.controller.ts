import { Body, Controller, Get, Headers, Post, Patch, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomerAuthService } from './customer-auth.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(
    private readonly customerAuthService: CustomerAuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() data: RegisterCustomerDto) {
    return this.customerAuthService.register(data);
  }

  @Post('login')
  async login(@Body() data: LoginCustomerDto) {
    return this.customerAuthService.login(data);
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não informado.');
    }

    const token = authorization.replace('Bearer ', '');

    const payload = await this.jwtService.verifyAsync(token);

    return this.customerAuthService.getProfile(payload.sub);
  }

  @Patch('me')
  async updateMe(
    @Headers('authorization') authorization: string | undefined,
    @Body() data: UpdateCustomerDto,
  ) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não informado.');
    }

    const token = authorization.replace('Bearer ', '');
    const payload = await this.jwtService.verifyAsync(token);

    return this.customerAuthService.updateProfile(payload.sub, data);
  }

  @Get('dashboard')
  async dashboard(@Headers('authorization') authorization?: string) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não informado.');
    }

    const token = authorization.replace('Bearer ', '');

    const payload = await this.jwtService.verifyAsync(token);

    return this.customerAuthService.getDashboard(payload.sub);
  }
}