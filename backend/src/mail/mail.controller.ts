import { Controller, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test-customer')
  async testCustomerEmail(@Query('to') to: string) {
    if (!to) {
      return { error: 'Parâmetro "to" é obrigatório.' };
    }

    await this.mailService.sendAppointmentCreatedToClient({
      customerName: 'Maria Silva',
      customerEmail: to,
      date: '25/03/2026',
      startTime: '14:00',
    });

    return { message: 'E-mail de cliente enviado com sucesso.' };
  }

  @Get('test-admin')
  async testAdminEmail() {
    await this.mailService.sendNewAppointmentToAdmin({
      customerName: 'Samuel Fernandes',
      customerPhone: '+55 69 99384-6851',
      customerEmail: 'samuel@exemplo.com',
      date: '25/03/2026',
      startTime: '14:00',
      serviceNames: ['Podologia', 'Pedicure com Verniz Gel'],
      notes: 'Cliente relatou sensibilidade no pé direito.',
      imageUrl: 'https://via.placeholder.com/600x400',
    });

    return { message: 'E-mail de admin enviado com sucesso.' };
  }
}