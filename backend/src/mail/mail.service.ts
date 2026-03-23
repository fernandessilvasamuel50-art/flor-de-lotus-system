import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendNewAppointmentToAdmin(
    data: AdminAppointmentEmailPayload,
  ): Promise<void> {
    const adminUrl = `${process.env.FRONTEND_URL}/admin/solicitacoes`;

    await this.transporter.sendMail({
      from: `"Flor de Lótus Podologia" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      subject: '🌸 Nova solicitação de atendimento • Flor de Lótus',
      html: `
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
              
              <!-- Header -->
              <div style="background:#FCFAF8;padding:28px 32px;border-bottom:1px solid #E8DDD1;text-align:center;">
                <div style="font-size:40px;margin-bottom:12px;">🌸</div>
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#A98C72;">
                  Administração
                </p>
                <h1 style="margin:0;font-size:28px;color:#7A624D;">
                  Nova solicitação recebida
                </h1>
              </div>
              
              <!-- Content -->
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
              
              <!-- Footer -->
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

    await this.transporter.sendMail({
      from: `"Flor de Lótus Podologia" <${process.env.MAIL_USER}>`,
      to: data.customerEmail,
      subject: '✨ Agendamento recebido • Flor de Lótus',
      html: `
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
              
              <!-- Header -->
              <div style="background:#FCFAF8;padding:28px 32px;border-bottom:1px solid #E8DDD1;text-align:center;">
                <div style="font-size:40px;margin-bottom:12px;">🌸</div>
                <h1 style="margin:0 0 8px;font-size:28px;color:#7A624D;">
                  Tudo certo com o seu pedido!
                </h1>
              </div>
              
              <!-- Content -->
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
              
              <!-- Footer -->
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

  // ✅ NOVO: E-mail de confirmação
  async sendAppointmentConfirmedToClient(data: CustomerAppointmentEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"Flor de Lótus Podologia" <${process.env.MAIL_USER}>`,
      to: data.customerEmail,
      subject: '✅ Agendamento confirmado • Flor de Lótus',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agendamento confirmado</title>
        </head>
        <body style="margin:0;padding:0;background:#F8F5F1;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
            <div style="background:#ffffff;border-radius:24px;border:1px solid #E8DDD1;overflow:hidden;">
              <div style="background:#FCFAF8;padding:28px 32px;border-bottom:1px solid #E8DDD1;text-align:center;">
                <div style="font-size:40px;margin-bottom:12px;">✅</div>
                <h1 style="margin:0 0 8px;font-size:28px;color:#7A624D;">
                  Agendamento confirmado!
                </h1>
              </div>
              <div style="padding:32px;">
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#8B735C;">
                  Olá, <strong>${data.customerName}</strong>!
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#8B735C;">
                  Seu atendimento foi confirmado com sucesso.
                </p>
                <div style="background:#FBF8F4;border:1px solid #E8DDD1;border-radius:18px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>📅 Data:</strong> ${data.date}</p>
                  <p style="margin:0;color:#7A624D;font-size:15px;"><strong>⏰ Horário:</strong> ${data.startTime}</p>
                </div>
                <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#8B735C;text-align:center;">
                  Nos vemos em breve! 💚
                </p>
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

  // ✅ NOVO: E-mail de cancelamento
  async sendAppointmentCancelledToClient(data: CustomerAppointmentEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"Flor de Lótus Podologia" <${process.env.MAIL_USER}>`,
      to: data.customerEmail,
      subject: '❌ Agendamento cancelado • Flor de Lótus',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agendamento cancelado</title>
        </head>
        <body style="margin:0;padding:0;background:#F8F5F1;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
            <div style="background:#ffffff;border-radius:24px;border:1px solid #E8DDD1;overflow:hidden;">
              <div style="background:#FCFAF8;padding:28px 32px;border-bottom:1px solid #E8DDD1;text-align:center;">
                <div style="font-size:40px;margin-bottom:12px;">❌</div>
                <h1 style="margin:0 0 8px;font-size:28px;color:#7A624D;">
                  Agendamento cancelado
                </h1>
              </div>
              <div style="padding:32px;">
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#8B735C;">
                  Olá, <strong>${data.customerName}</strong>!
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#8B735C;">
                  Informamos que seu atendimento foi cancelado.
                </p>
                <div style="background:#FBF8F4;border:1px solid #E8DDD1;border-radius:18px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>📅 Data:</strong> ${data.date}</p>
                  <p style="margin:0;color:#7A624D;font-size:15px;"><strong>⏰ Horário:</strong> ${data.startTime}</p>
                </div>
                <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#8B735C;text-align:center;">
                  Para remarcar, entre em nosso sistema e crie uma nova solicitação.
                </p>
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

  // ✅ NOVO: E-mail de reagendamento
  async sendAppointmentRescheduledToClient(data: CustomerAppointmentEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"Flor de Lótus Podologia" <${process.env.MAIL_USER}>`,
      to: data.customerEmail,
      subject: '🔄 Agendamento reagendado • Flor de Lótus',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agendamento reagendado</title>
        </head>
        <body style="margin:0;padding:0;background:#F8F5F1;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
            <div style="background:#ffffff;border-radius:24px;border:1px solid #E8DDD1;overflow:hidden;">
              <div style="background:#FCFAF8;padding:28px 32px;border-bottom:1px solid #E8DDD1;text-align:center;">
                <div style="font-size:40px;margin-bottom:12px;">🔄</div>
                <h1 style="margin:0 0 8px;font-size:28px;color:#7A624D;">
                  Agendamento reagendado
                </h1>
              </div>
              <div style="padding:32px;">
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#8B735C;">
                  Olá, <strong>${data.customerName}</strong>!
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#8B735C;">
                  Seu atendimento foi reagendado para a nova data e horário abaixo.
                </p>
                <div style="background:#FBF8F4;border:1px solid #E8DDD1;border-radius:18px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>📅 Nova data:</strong> ${data.date}</p>
                  <p style="margin:0;color:#7A624D;font-size:15px;"><strong>⏰ Novo horário:</strong> ${data.startTime}</p>
                </div>
                <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#8B735C;text-align:center;">
                  Caso não possa comparecer, entre em nosso sistema e crie uma nova solicitação.
                </p>
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

  // ✅ NOVO: E-mail de não comparecimento
  async sendAppointmentNoShowToClient(data: CustomerAppointmentEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"Flor de Lótus Podologia" <${process.env.MAIL_USER}>`,
      to: data.customerEmail,
      subject: '⚠️ Não comparecimento registrado • Flor de Lótus',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Não comparecimento</title>
        </head>
        <body style="margin:0;padding:0;background:#F8F5F1;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
            <div style="background:#ffffff;border-radius:24px;border:1px solid #E8DDD1;overflow:hidden;">
              <div style="background:#FCFAF8;padding:28px 32px;border-bottom:1px solid #E8DDD1;text-align:center;">
                <div style="font-size:40px;margin-bottom:12px;">⚠️</div>
                <h1 style="margin:0 0 8px;font-size:28px;color:#7A624D;">
                  Não comparecimento registrado
                </h1>
              </div>
              <div style="padding:32px;">
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#8B735C;">
                  Olá, <strong>${data.customerName}</strong>!
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#8B735C;">
                  Registramos que você não compareceu ao atendimento abaixo.
                </p>
                <div style="background:#FBF8F4;border:1px solid #E8DDD1;border-radius:18px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0 0 12px;color:#7A624D;font-size:15px;"><strong>📅 Data:</strong> ${data.date}</p>
                  <p style="margin:0;color:#7A624D;font-size:15px;"><strong>⏰ Horário:</strong> ${data.startTime}</p>
                </div>
                <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#8B735C;text-align:center;">
                  Para remarcar, entre em nosso sistema e crie uma nova solicitação.
                </p>
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
}