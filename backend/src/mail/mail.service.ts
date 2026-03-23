import { Injectable } from '@nestjs/common';

type AdminAppointmentEmailPayload = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  startTime: string;
  serviceNames: string[];
  notes?: string;
  imageUrl?: string | null;
};

type CustomerAppointmentEmailPayload = {
  customerName: string;
  customerEmail: string;
  date: string;
  startTime: string;
};

@Injectable()
export class MailService {
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';
  private readonly apiKey = process.env.BREVO_API_KEY;

  private readonly fromEmail =
    process.env.MAIL_FROM || 'flordelotus.agendamento@gmail.com';

  private readonly fromName =
    process.env.MAIL_FROM_NAME || 'Flor de Lótus Podologia';

  private async sendEmail(params: {
    to: { email: string; name?: string }[];
    subject: string;
    htmlContent: string;
  }): Promise<any> {
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

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async sendNewAppointmentToAdmin(
    data: AdminAppointmentEmailPayload,
  ): Promise<void> {
    const adminUrl = `${process.env.FRONTEND_URL}/admin/solicitacoes`;

    await this.sendEmail({
      to: [
        {
          email: process.env.ADMIN_NOTIFICATION_EMAIL || '',
          name: 'Administração',
        },
      ],
      subject: '🌸 Nova solicitação de atendimento • Flor de Lótus',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nova solicitação</title>
        </head>
        <body style="margin:0;padding:0;background:#F8F5F1;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
            <div style="background:#ffffff;border-radius:24px;border:1px solid #E8DDD1;overflow:hidden;">
              <div style="background:#FCFAF8;padding:28px 32px;border-bottom:1px solid #E8DDD1;text-align:center;">
                <div style="font-size:40px;margin-bottom:12px;">🌸</div>
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#A98C72;">
                  Administração
                </p>
                <h1 style="margin:0;font-size:28px;color:#7A624D;">
                  Nova solicitação recebida
                </h1>
              </div>

              <div style="padding:32px;">
                <div style="background:#FBF8F4;border:1px solid #E8DDD1;border-radius:18px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>👤 Cliente:</strong> ${data.customerName}</p>
                  <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>📞 Telefone:</strong> ${data.customerPhone}</p>
                  <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>✉️ E-mail:</strong> ${data.customerEmail}</p>
                  <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>📅 Data:</strong> ${data.date}</p>
                  <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>⏰ Horário:</strong> ${data.startTime}</p>
                  <p style="margin:0;color:#7A624D;font-size:15px;"><strong>✨ Serviços:</strong> ${data.serviceNames.length ? data.serviceNames.join(', ') : 'Não informado'}</p>
                </div>

                ${
                  data.notes?.trim()
                    ? `
                  <div style="background:#FCFAF8;border:1px solid #E8DDD1;border-radius:18px;padding:20px;margin-bottom:24px;">
                    <p style="margin:0 0 8px;color:#7A624D;font-size:15px;"><strong>📝 Observações do cliente:</strong></p>
                    <p style="margin:0;color:#8B735C;font-size:14px;line-height:1.6;">${data.notes}</p>
                  </div>
                `
                    : ''
                }

                ${
                  data.imageUrl
                    ? `
                  <div style="background:#FCFAF8;border:1px solid #E8DDD1;border-radius:18px;padding:20px;margin-bottom:24px;">
                    <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>🖼️ Imagem enviada:</strong></p>
                    <a href="${data.imageUrl}" style="color:#A98C72;text-decoration:underline;">Clique aqui para visualizar</a>
                  </div>
                `
                    : ''
                }

                <div style="text-align:center;margin:32px 0;">
                  <a href="${adminUrl}" style="display:inline-block;background:#BFA58A;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:14px;font-weight:500;">
                    Acessar solicitações
                  </a>
                </div>
              </div>

              <div style="background:#FCFAF8;padding:20px 32px;border-top:1px solid #E8DDD1;text-align:center;">
                <p style="margin:0;font-size:12px;color:#A98C72;">
                  Flor de Lótus Podologia • Cuidado e bem-estar
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendAppointmentCreatedToClient(
    data: CustomerAppointmentEmailPayload,
  ): Promise<void> {
    const panelUrl = `${process.env.FRONTEND_URL}/cliente/painel`;

    await this.sendEmail({
      to: [
        {
          email: data.customerEmail,
          name: data.customerName,
        },
      ],
      subject: '✨ Agendamento recebido • Flor de Lótus',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agendamento recebido</title>
        </head>
        <body style="margin:0;padding:0;background:#F8F5F1;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
            <div style="background:#ffffff;border-radius:24px;border:1px solid #E8DDD1;overflow:hidden;">
              <div style="background:#FCFAF8;padding:28px 32px;border-bottom:1px solid #E8DDD1;text-align:center;">
                <div style="font-size:40px;margin-bottom:12px;">🌸</div>
                <h1 style="margin:0 0 8px;font-size:28px;color:#7A624D;">
                  Tudo certo com o seu pedido!
                </h1>
              </div>

              <div style="padding:32px;">
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#8B735C;">
                  Olá, <strong>${data.customerName}</strong>!
                </p>

                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#8B735C;">
                  Recebemos sua solicitação de agendamento com sucesso. Em breve, o espaço Flor de Lótus irá analisar seu pedido.
                </p>

                <div style="background:#FBF8F4;border:1px solid #E8DDD1;border-radius:18px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>📅 Data solicitada:</strong> ${data.date}</p>
                  <p style="margin:0;color:#7A624D;font-size:15px;"><strong>⏰ Horário solicitado:</strong> ${data.startTime}</p>
                </div>

                <div style="background:#FBF8F4;border:1px solid #E8DDD1;border-radius:18px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>💡 Próximos passos:</strong></p>
                  <p style="margin:0;color:#8B735C;font-size:14px;line-height:1.6;">
                    • Nosso espaço vai analisar sua solicitação<br>
                    • Você receberá a confirmação por e-mail<br>
                    • Acompanhe pelo seu painel do cliente
                  </p>
                </div>

                <div style="text-align:center;margin:32px 0;">
                  <a href="${panelUrl}" style="display:inline-block;background:#BFA58A;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:14px;font-weight:500;">
                    Acessar meu painel
                  </a>
                </div>

                <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#8B735C;text-align:center;">
                  Todas as atualizações do seu atendimento serão enviadas para este e-mail.
                </p>
              </div>

              <div style="background:#FCFAF8;padding:20px 32px;border-top:1px solid #E8DDD1;text-align:center;">
                <p style="margin:0;font-size:12px;color:#A98C72;">
                  Flor de Lótus Podologia • Cuidado e bem-estar em cada detalhe
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendAppointmentConfirmedToClient(
    data: CustomerAppointmentEmailPayload,
  ): Promise<void> {
    await this.sendEmail({
      to: [
        {
          email: data.customerEmail,
          name: data.customerName,
        },
      ],
      subject: '✅ Agendamento confirmado • Flor de Lótus',
      htmlContent: `
        <h2>Agendamento confirmado</h2>
        <p>Olá, <strong>${data.customerName}</strong>!</p>
        <p>Seu atendimento foi confirmado com sucesso.</p>
        <p><strong>Data:</strong> ${data.date}</p>
        <p><strong>Horário:</strong> ${data.startTime}</p>
      `,
    });
  }

  async sendAppointmentCancelledToClient(
    data: CustomerAppointmentEmailPayload,
  ): Promise<void> {
    await this.sendEmail({
      to: [
        {
          email: data.customerEmail,
          name: data.customerName,
        },
      ],
      subject: '❌ Agendamento cancelado • Flor de Lótus',
      htmlContent: `
        <h2>Agendamento cancelado</h2>
        <p>Olá, <strong>${data.customerName}</strong>!</p>
        <p>Seu atendimento foi cancelado.</p>
        <p><strong>Data:</strong> ${data.date}</p>
        <p><strong>Horário:</strong> ${data.startTime}</p>
      `,
    });
  }

  async sendAppointmentRescheduledToClient(
    data: CustomerAppointmentEmailPayload,
  ): Promise<void> {
    await this.sendEmail({
      to: [
        {
          email: data.customerEmail,
          name: data.customerName,
        },
      ],
      subject: '🔄 Agendamento reagendado • Flor de Lótus',
      htmlContent: `
        <h2>Agendamento reagendado</h2>
        <p>Olá, <strong>${data.customerName}</strong>!</p>
        <p>Seu atendimento foi reagendado.</p>
        <p><strong>Nova data:</strong> ${data.date}</p>
        <p><strong>Novo horário:</strong> ${data.startTime}</p>
      `,
    });
  }

  async sendAppointmentNoShowToClient(
    data: CustomerAppointmentEmailPayload,
  ): Promise<void> {
    await this.sendEmail({
      to: [
        {
          email: data.customerEmail,
          name: data.customerName,
        },
      ],
      subject: '⚠️ Não comparecimento registrado • Flor de Lótus',
      htmlContent: `
        <h2>Não comparecimento registrado</h2>
        <p>Olá, <strong>${data.customerName}</strong>!</p>
        <p>Registramos que você não compareceu ao atendimento abaixo.</p>
        <p><strong>Data:</strong> ${data.date}</p>
        <p><strong>Horário:</strong> ${data.startTime}</p>
      `,
    });
  }
}