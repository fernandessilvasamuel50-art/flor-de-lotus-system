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

type AdminMessageNotificationPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  messagePreview: string;
};

type CustomerMessageNotificationPayload = {
  customerName: string;
  customerEmail: string;
  messagePreview: string;
};

type EmailTemplateParams = {
  eyebrow?: string;
  title: string;
  intro: string;
  details?: string;
  cta?: {
    label: string;
    url: string;
  };
  footer?: string;
};

@Injectable()
export class MailService {
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';
  private readonly apiKey = process.env.BREVO_API_KEY;
  private readonly brandName = 'Sublime Pés';
  private readonly brandSignature =
    'Sublime Pés • Cuidado profissional, conforto e bem-estar';
  private readonly frontendUrl =
    process.env.FRONTEND_URL?.replace(/\/$/, '') || 'http://localhost:3000';

  private readonly fromEmail =
    process.env.MAIL_FROM || 'roselipereiradasilva2411@gmail.com';

  private readonly fromName = process.env.MAIL_FROM_NAME || this.brandName;

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

  private buildUrl(path: string): string {
    return `${this.frontendUrl}${path}`;
  }

  private detailRow(label: string, value: string): string {
    return `<p style="margin:0 0 12px;color:#6F5358;font-size:15px;"><strong>${label}:</strong> ${value}</p>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private getMessagePreview(value: string): string {
    const normalized = value.trim().replace(/\s+/g, ' ');
    const preview =
      normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized;

    return this.escapeHtml(preview);
  }

  private renderTemplate(params: EmailTemplateParams): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${params.title} • ${this.brandName}</title>
      </head>
      <body style="margin:0;padding:0;background:#FAF6F2;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
          <div style="background:#ffffff;border-radius:24px;border:1px solid #EADBD5;overflow:hidden;">
            <div style="background:#FFF9F6;padding:30px 32px;border-bottom:1px solid #EADBD5;text-align:center;">
              <div style="font-size:34px;margin-bottom:12px;">✨</div>
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#B8897F;">
                ${params.eyebrow || this.brandName}
              </p>
              <h1 style="margin:0;font-size:27px;line-height:1.25;color:#6F5358;">
                ${params.title}
              </h1>
            </div>

            <div style="padding:32px;">
              <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#7B6261;">
                ${params.intro}
              </p>

              ${
                params.details
                  ? `<div style="background:#FBF4F1;border:1px solid #EADBD5;border-radius:18px;padding:20px;margin-bottom:24px;">${params.details}</div>`
                  : ''
              }

              ${
                params.cta
                  ? `<div style="text-align:center;margin:30px 0 6px;">
                      <a href="${params.cta.url}" style="display:inline-block;background:#B8897F;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:14px;font-weight:500;">
                        ${params.cta.label}
                      </a>
                    </div>`
                  : ''
              }

              ${
                params.footer
                  ? `<p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#7B6261;text-align:center;">${params.footer}</p>`
                  : ''
              }
            </div>

            <div style="background:#FFF9F6;padding:20px 32px;border-top:1px solid #EADBD5;text-align:center;">
              <p style="margin:0;font-size:12px;color:#B8897F;">
                ${this.brandSignature}
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendNewAppointmentToAdmin(
    data: AdminAppointmentEmailPayload,
  ): Promise<void> {
    const adminUrl = this.buildUrl('/admin/solicitacoes');

    const details = `
      ${this.detailRow('Cliente', data.customerName)}
      ${this.detailRow('Telefone', data.customerPhone)}
      ${this.detailRow('E-mail', data.customerEmail)}
      ${this.detailRow('Data', data.date)}
      ${this.detailRow('Horário', data.startTime)}
      ${this.detailRow(
        'Serviços',
        data.serviceNames.length
          ? data.serviceNames.join(', ')
          : 'Não informado',
      )}
      ${
        data.notes?.trim()
          ? `<p style="margin:18px 0 8px;color:#6F5358;font-size:15px;"><strong>Observações da cliente:</strong></p>
             <p style="margin:0;color:#7B6261;font-size:14px;line-height:1.6;">${data.notes}</p>`
          : ''
      }
      ${
        data.imageUrl
          ? `<p style="margin:18px 0 8px;color:#6F5358;font-size:15px;"><strong>Imagem enviada:</strong></p>
             <a href="${data.imageUrl}" style="color:#B8897F;text-decoration:underline;">Visualizar imagem para avaliação</a>`
          : ''
      }
    `;

    await this.sendEmail({
      to: [
        {
          email: process.env.ADMIN_NOTIFICATION_EMAIL || '',
          name: 'Administração',
        },
      ],
      subject: `✨ Nova solicitação de atendimento • ${this.brandName}`,
      htmlContent: this.renderTemplate({
        eyebrow: 'Administração',
        title: 'Nova solicitação recebida',
        intro:
          'Uma nova solicitação de atendimento foi enviada e está aguardando análise no painel administrativo.',
        details,
        cta: {
          label: 'Acessar solicitações',
          url: adminUrl,
        },
      }),
    });
  }

  async sendAppointmentCreatedToClient(
    data: CustomerAppointmentEmailPayload,
  ): Promise<void> {
    const panelUrl = this.buildUrl('/cliente/painel');

    await this.sendEmail({
      to: [
        {
          email: data.customerEmail,
          name: data.customerName,
        },
      ],
      subject: `✨ Agendamento recebido • ${this.brandName}`,
      htmlContent: this.renderTemplate({
        title: 'Agendamento recebido',
        intro: `Olá, <strong>${data.customerName}</strong>! Recebemos sua solicitação de agendamento com sucesso. Em breve, a Sublime Pés irá analisar seu pedido com atenção.`,
        details: `
          ${this.detailRow('Data solicitada', data.date)}
          ${this.detailRow('Horário solicitado', data.startTime)}
          <p style="margin:18px 0 0;color:#7B6261;font-size:14px;line-height:1.6;">
            A confirmação será enviada por e-mail assim que a solicitação for analisada.
          </p>
        `,
        cta: {
          label: 'Acessar meu painel',
          url: panelUrl,
        },
        footer:
          'Todas as atualizações do seu atendimento serão enviadas para este e-mail.',
      }),
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
      subject: `✅ Agendamento confirmado • ${this.brandName}`,
      htmlContent: this.renderTemplate({
        title: 'Agendamento confirmado',
        intro: `Olá, <strong>${data.customerName}</strong>! Seu atendimento na Sublime Pés foi confirmado com sucesso.`,
        details: `
          ${this.detailRow('Data', data.date)}
          ${this.detailRow('Horário', data.startTime)}
        `,
        footer:
          'Esperamos você para um atendimento cuidadoso, profissional e confortável.',
      }),
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
      subject: `❌ Agendamento cancelado • ${this.brandName}`,
      htmlContent: this.renderTemplate({
        title: 'Agendamento cancelado',
        intro: `Olá, <strong>${data.customerName}</strong>. Seu atendimento foi cancelado.`,
        details: `
          ${this.detailRow('Data', data.date)}
          ${this.detailRow('Horário', data.startTime)}
        `,
        footer:
          'Quando desejar, você pode fazer uma nova solicitação pelo painel do cliente.',
      }),
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
      subject: `🔄 Agendamento reagendado • ${this.brandName}`,
      htmlContent: this.renderTemplate({
        title: 'Agendamento reagendado',
        intro: `Olá, <strong>${data.customerName}</strong>! Seu atendimento na Sublime Pés foi reagendado.`,
        details: `
          ${this.detailRow('Nova data', data.date)}
          ${this.detailRow('Novo horário', data.startTime)}
        `,
        footer:
          'Agradecemos a compreensão e seguimos à disposição para cuidar de você.',
      }),
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
      subject: `⚠️ Não comparecimento registrado • ${this.brandName}`,
      htmlContent: this.renderTemplate({
        title: 'Não comparecimento registrado',
        intro: `Olá, <strong>${data.customerName}</strong>. Registramos que você não compareceu ao atendimento abaixo.`,
        details: `
          ${this.detailRow('Data', data.date)}
          ${this.detailRow('Horário', data.startTime)}
        `,
        footer:
          'Para organizar um novo horário, faça uma nova solicitação pelo painel do cliente.',
      }),
    });
  }

  async sendNewMessageToAdmin(
    data: AdminMessageNotificationPayload,
  ): Promise<void> {
    const adminMessagesUrl = this.buildUrl('/admin/mensagens');

    await this.sendEmail({
      to: [
        {
          email: process.env.ADMIN_NOTIFICATION_EMAIL || '',
          name: 'Administração',
        },
      ],
      subject: `💌 Nova mensagem • ${this.brandName}`,
      htmlContent: this.renderTemplate({
        eyebrow: 'Atendimento online',
        title: 'Nova mensagem recebida',
        intro: `${this.escapeHtml(
          data.customerName,
        )} enviou uma nova mensagem pelo atendimento online da Sublime Pés.`,
        details: `
          ${this.detailRow('Cliente', this.escapeHtml(data.customerName))}
          ${this.detailRow('E-mail', this.escapeHtml(data.customerEmail))}
          ${this.detailRow('Telefone', this.escapeHtml(data.customerPhone))}
          <p style="margin:18px 0 8px;color:#6F5358;font-size:15px;"><strong>Preview da mensagem:</strong></p>
          <p style="margin:0;color:#7B6261;font-size:14px;line-height:1.6;">${this.getMessagePreview(
            data.messagePreview,
          )}</p>
        `,
        cta: {
          label: 'Ver e responder',
          url: adminMessagesUrl,
        },
      }),
    });
  }

  async sendMessageReplyToCustomer(
    data: CustomerMessageNotificationPayload,
  ): Promise<void> {
    const customerMessagesUrl = this.buildUrl('/cliente/painel/mensagens');

    await this.sendEmail({
      to: [
        {
          email: data.customerEmail,
          name: data.customerName,
        },
      ],
      subject: `💌 Você recebeu uma resposta • ${this.brandName}`,
      htmlContent: this.renderTemplate({
        eyebrow: 'Atendimento online',
        title: 'Você recebeu uma resposta',
        intro: `Olá, <strong>${this.escapeHtml(
          data.customerName,
        )}</strong>! A Sublime Pés respondeu sua mensagem no atendimento online.`,
        details: `
          <p style="margin:0 0 8px;color:#6F5358;font-size:15px;"><strong>Preview da resposta:</strong></p>
          <p style="margin:0;color:#7B6261;font-size:14px;line-height:1.6;">${this.getMessagePreview(
            data.messagePreview,
          )}</p>
        `,
        cta: {
          label: 'Ver mensagem',
          url: customerMessagesUrl,
        },
        footer:
          'Para preservar seu histórico, responda pelo painel do cliente.',
      }),
    });
  }
}
