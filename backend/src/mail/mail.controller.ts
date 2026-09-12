import { Controller, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test-customer')
  async testCustomerEmail(@Query('to') to: string) {
    if (!to) {
      return {
        error:
          'Parâmetro "to" é obrigatório. Use /mail/test-customer?to=seuemail@gmail.com',
      };
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
      customerEmail: 'kakaroto3515@gmail.com',
      date: '25/03/2026',
      startTime: '14:00',
      serviceNames: ['Podologia', 'Pedicure com Verniz Gel'],
      notes: 'Cliente relatou sensibilidade no pé direito.',
      imageUrl: 'https://via.placeholder.com/600x400',
    });

    return { message: 'E-mail de admin enviado com sucesso.' };
  }

  @Get('test-confirmed')
  async testConfirmedEmail(@Query('to') to: string) {
    if (!to) {
      return {
        error:
          'Parâmetro "to" é obrigatório. Use /mail/test-confirmed?to=seuemail@gmail.com',
      };
    }

    await this.mailService.sendAppointmentConfirmedToClient({
      customerName: 'Maria Silva',
      customerEmail: to,
      date: '26/03/2026',
      startTime: '15:30',
    });

    return { message: 'E-mail de confirmação enviado com sucesso.' };
  }

  @Get('test-cancelled')
  async testCancelledEmail(@Query('to') to: string) {
    if (!to) {
      return {
        error:
          'Parâmetro "to" é obrigatório. Use /mail/test-cancelled?to=seuemail@gmail.com',
      };
    }

    await this.mailService.sendAppointmentCancelledToClient({
      customerName: 'Maria Silva',
      customerEmail: to,
      date: '27/03/2026',
      startTime: '10:00',
    });

    return { message: 'E-mail de cancelamento enviado com sucesso.' };
  }

  @Get('test-rescheduled')
  async testRescheduledEmail(@Query('to') to: string) {
    if (!to) {
      return {
        error:
          'Parâmetro "to" é obrigatório. Use /mail/test-rescheduled?to=seuemail@gmail.com',
      };
    }

    await this.mailService.sendAppointmentRescheduledToClient({
      customerName: 'Maria Silva',
      customerEmail: to,
      date: '28/03/2026',
      startTime: '16:00',
    });

    return { message: 'E-mail de reagendamento enviado com sucesso.' };
  }

  @Get('test-no-show')
  async testNoShowEmail(@Query('to') to: string) {
    if (!to) {
      return {
        error:
          'Parâmetro "to" é obrigatório. Use /mail/test-no-show?to=seuemail@gmail.com',
      };
    }

    await this.mailService.sendAppointmentNoShowToClient({
      customerName: 'Maria Silva',
      customerEmail: to,
      date: '29/03/2026',
      startTime: '09:00',
    });

    return { message: 'E-mail de ausência enviado com sucesso.' };
  }
}
