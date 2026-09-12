import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly client: ReturnType<typeof twilio> | null;
  private readonly from: string | undefined;
  private readonly brandName = 'Sublime Pés';

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.from = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !this.from) {
      this.logger.warn(
        'Twilio WhatsApp não configurado completamente. Verifique TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_WHATSAPP_NUMBER.',
      );
      this.client = null;
      return;
    }

    this.client = twilio(accountSid, authToken);
  }

  private formatPhoneToWhatsapp(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (!digits) {
      throw new Error('Telefone inválido para envio de WhatsApp.');
    }

    if (digits.startsWith('55')) {
      return `whatsapp:+${digits}`;
    }

    return `whatsapp:+55${digits}`;
  }

  private async send(to: string, body: string) {
    if (!this.client || !this.from) {
      this.logger.warn(
        `WhatsApp não enviado porque o serviço não está configurado. Destino: ${to}`,
      );
      return null;
    }

    const formattedTo = this.formatPhoneToWhatsapp(to);

    try {
      const message = await this.client.messages.create({
        from: this.from,
        to: formattedTo,
        body,
      });

      this.logger.log(
        `WhatsApp enviado com sucesso para ${formattedTo}. SID: ${message.sid}`,
      );

      return message;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido no WhatsApp';

      this.logger.error(
        `Erro ao enviar WhatsApp para ${formattedTo}: ${message}`,
      );

      return null;
    }
  }

  async sendAppointmentCreatedToCustomer(params: {
    customerName: string;
    customerPhone: string;
    serviceNames: string[];
    date: string;
    startTime: string;
    panelUrl: string;
  }) {
    const body =
      `${this.brandName}\n\n` +
      `Olá, ${params.customerName}!\n\n` +
      `Recebemos sua solicitação de agendamento com sucesso.\n\n` +
      `Serviço(s): ${params.serviceNames.join(', ')}\n` +
      `Data: ${params.date}\n` +
      `Horário: ${params.startTime}\n\n` +
      `Sua solicitação está aguardando confirmação da profissional responsável.\n\n` +
      `Acompanhe pelo painel:\n${params.panelUrl}`;

    return this.send(params.customerPhone, body);
  }

  async sendAppointmentConfirmedToCustomer(params: {
    customerName: string;
    customerPhone: string;
    serviceNames: string[];
    date: string;
    startTime: string;
    panelUrl: string;
  }) {
    const body =
      `${this.brandName}\n\n` +
      `✅ Agendamento confirmado!\n\n` +
      `Olá, ${params.customerName}!\n\n` +
      `Seu atendimento foi confirmado com sucesso.\n\n` +
      `Serviço(s): ${params.serviceNames.join(', ')}\n` +
      `Data: ${params.date}\n` +
      `Horário: ${params.startTime}\n\n` +
      `Acompanhe os detalhes pelo painel:\n${params.panelUrl}`;

    return this.send(params.customerPhone, body);
  }

  async sendAppointmentCancelledToCustomer(params: {
    customerName: string;
    customerPhone: string;
    serviceNames: string[];
    date: string;
    startTime: string;
    panelUrl: string;
  }) {
    const body =
      `${this.brandName}\n\n` +
      `Olá, ${params.customerName}.\n\n` +
      `Seu agendamento foi cancelado.\n\n` +
      `Serviço(s): ${params.serviceNames.join(', ')}\n` +
      `Data: ${params.date}\n` +
      `Horário: ${params.startTime}\n\n` +
      `Você pode acompanhar ou fazer uma nova solicitação pelo painel:\n${params.panelUrl}`;

    return this.send(params.customerPhone, body);
  }

  async sendAppointmentRescheduledToCustomer(params: {
    customerName: string;
    customerPhone: string;
    serviceNames: string[];
    date: string;
    startTime: string;
    panelUrl: string;
  }) {
    const body =
      `${this.brandName}\n\n` +
      `🔄 Agendamento reagendado\n\n` +
      `Olá, ${params.customerName}!\n\n` +
      `Seu atendimento foi reagendado.\n\n` +
      `Serviço(s): ${params.serviceNames.join(', ')}\n` +
      `Nova data: ${params.date}\n` +
      `Novo horário: ${params.startTime}\n\n` +
      `Acompanhe pelo painel:\n${params.panelUrl}`;

    return this.send(params.customerPhone, body);
  }
}
