import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';
  private readonly apiKey = process.env.BREVO_API_KEY;

  private readonly fromEmail =
    process.env.MAIL_FROM || 'contato@flordelotus.com';

  private readonly fromName =
    process.env.MAIL_FROM_NAME || 'Flor de Lótus';

  private async sendEmail(params: {
    to: { email: string; name?: string }[];
    subject: string;
    htmlContent: string;
  }) {
    if (!this.apiKey) {
      throw new Error('BREVO_API_KEY não configurada.');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: this.fromName,
          email: this.fromEmail,
        },
        to: params.to,
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro Brevo API: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async sendNewAppointmentToAdmin(data: any) {
    await this.sendEmail({
      to: [
        {
          email: process.env.ADMIN_NOTIFICATION_EMAIL || '',
          name: 'Admin',
        },
      ],
      subject: '📅 Nova solicitação de agendamento',
      htmlContent: `
        <h2>Nova solicitação recebida</h2>
        <p><strong>Nome:</strong> ${data.customerName}</p>
        <p><strong>Telefone:</strong> ${data.customerPhone}</p>
        <p><strong>Email:</strong> ${data.customerEmail}</p>
        <p><strong>Data:</strong> ${data.date}</p>
        <p><strong>Horário:</strong> ${data.startTime}</p>
        <p><strong>Observações:</strong> ${data.notes || 'Nenhuma'}</p>
        ${data.imageUrl ? `<p><strong>Imagem:</strong> <a href="${data.imageUrl}">Ver imagem</a></p>` : ''}
      `,
    });
  }

  async sendAppointmentCreatedToClient(data: any) {
    await this.sendEmail({
      to: [
        {
          email: data.customerEmail,
          name: data.customerName,
        },
      ],
      subject: '✅ Solicitação recebida',
      htmlContent: `
        <h2>Solicitação recebida com sucesso</h2>
        <p>Olá ${data.customerName},</p>
        <p>Sua solicitação foi enviada e está aguardando confirmação da podóloga.</p>
        <p><strong>Data:</strong> ${data.date}</p>
        <p><strong>Horário:</strong> ${data.startTime}</p>
        <br/>
        <p>Em breve você receberá a confirmação.</p>
      `,
    });
  }
}