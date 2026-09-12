import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageSender } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

const MESSAGE_MAX_LENGTH = 2000;

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async getCustomerConversation(customerId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { customerId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const unreadCount = conversation
      ? await this.getUnreadCount(conversation.id, MessageSender.ADMIN)
      : 0;

    return {
      conversationId: conversation?.id ?? null,
      unreadCount,
      messages: conversation?.messages ?? [],
    };
  }

  async sendCustomerMessage(customerId: string, content?: string) {
    const normalizedContent = this.normalizeContent(content);

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
      throw new NotFoundException('Cliente não encontrado.');
    }

    const conversation = await this.prisma.conversation.upsert({
      where: { customerId },
      create: { customerId },
      update: { updatedAt: new Date() },
    });

    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: MessageSender.CUSTOMER,
        content: normalizedContent,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    void this.mailService
      .sendNewMessageToAdmin({
        customerName: customer.name,
        customerEmail: customer.email || 'E-mail não informado',
        customerPhone: customer.phone,
        messagePreview: normalizedContent,
      })
      .catch((error) => {
        console.error('Erro ao enviar e-mail de nova mensagem:', error);
      });

    return message;
  }

  async markCustomerConversationAsRead(customerId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { customerId },
    });

    if (!conversation) {
      return { count: 0 };
    }

    return this.prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderType: MessageSender.ADMIN,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async listAdminConversations() {
    const conversations = await this.prisma.conversation.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                senderType: MessageSender.CUSTOMER,
                readAt: null,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      unreadCount: conversations.reduce(
        (total, conversation) => total + conversation._count.messages,
        0,
      ),
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        customer: conversation.customer,
        lastMessage: conversation.messages[0] ?? null,
        unreadCount: conversation._count.messages,
        updatedAt: conversation.updatedAt,
      })),
    };
  }

  async getAdminConversation(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    const unreadCount = await this.getUnreadCount(
      conversation.id,
      MessageSender.CUSTOMER,
    );

    return {
      id: conversation.id,
      customer: conversation.customer,
      messages: conversation.messages,
      unreadCount,
      updatedAt: conversation.updatedAt,
    };
  }

  async sendAdminMessage(conversationId: string, content?: string) {
    const normalizedContent = this.normalizeContent(content);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderType: MessageSender.ADMIN,
        content: normalizedContent,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    if (conversation.customer.email) {
      void this.mailService
        .sendMessageReplyToCustomer({
          customerName: conversation.customer.name,
          customerEmail: conversation.customer.email,
          messagePreview: normalizedContent,
        })
        .catch((error) => {
          console.error('Erro ao enviar e-mail de resposta:', error);
        });
    }

    return message;
  }

  async markAdminConversationAsRead(conversationId: string) {
    await this.ensureConversationExists(conversationId);

    return this.prisma.message.updateMany({
      where: {
        conversationId,
        senderType: MessageSender.CUSTOMER,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  private async ensureConversationExists(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada.');
    }
  }

  private async getUnreadCount(
    conversationId: string,
    senderType: MessageSender,
  ) {
    return this.prisma.message.count({
      where: {
        conversationId,
        senderType,
        readAt: null,
      },
    });
  }

  private normalizeContent(content = '') {
    const normalizedContent = content.trim();

    if (!normalizedContent) {
      throw new BadRequestException('Digite uma mensagem antes de enviar.');
    }

    if (normalizedContent.length > MESSAGE_MAX_LENGTH) {
      throw new BadRequestException(
        `A mensagem deve ter no máximo ${MESSAGE_MAX_LENGTH} caracteres.`,
      );
    }

    return normalizedContent;
  }
}
