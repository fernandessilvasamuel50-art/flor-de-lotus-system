import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminJwtAuthGuard } from '../common/guards/admin-jwt-auth.guard';
import type { AuthTokenPayload } from '../common/types/auth-token-payload';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('customer')
  async getCustomerConversation(
    @Headers('authorization') authorization?: string,
  ) {
    const customerId = await this.getAuthenticatedCustomerId(authorization);

    return this.messagesService.getCustomerConversation(customerId);
  }

  @Post('customer')
  async sendCustomerMessage(
    @Headers('authorization') authorization: string | undefined,
    @Body() data: SendMessageDto,
  ) {
    const customerId = await this.getAuthenticatedCustomerId(authorization);

    return this.messagesService.sendCustomerMessage(customerId, data.content);
  }

  @Patch('customer/read')
  async markCustomerConversationAsRead(
    @Headers('authorization') authorization?: string,
  ) {
    const customerId = await this.getAuthenticatedCustomerId(authorization);

    return this.messagesService.markCustomerConversationAsRead(customerId);
  }

  @Get('admin/conversations')
  @UseGuards(AdminJwtAuthGuard)
  async listAdminConversations() {
    return this.messagesService.listAdminConversations();
  }

  @Get('admin/conversations/:id')
  @UseGuards(AdminJwtAuthGuard)
  async getAdminConversation(@Param('id') id: string) {
    return this.messagesService.getAdminConversation(id);
  }

  @Post('admin/conversations/:id')
  @UseGuards(AdminJwtAuthGuard)
  async sendAdminMessage(
    @Param('id') id: string,
    @Body() data: SendMessageDto,
  ) {
    return this.messagesService.sendAdminMessage(id, data.content);
  }

  @Patch('admin/conversations/:id/read')
  @UseGuards(AdminJwtAuthGuard)
  async markAdminConversationAsRead(@Param('id') id: string) {
    return this.messagesService.markAdminConversationAsRead(id);
  }

  private async getAuthenticatedCustomerId(authorization?: string) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Entre na sua conta para enviar mensagens.',
      );
    }

    const token = authorization.replace('Bearer ', '');
    const payload = await this.jwtService.verifyAsync<AuthTokenPayload>(token);

    if (payload.role !== 'customer' || !payload.sub) {
      throw new UnauthorizedException('Acesso permitido apenas para clientes.');
    }

    return payload.sub;
  }
}
