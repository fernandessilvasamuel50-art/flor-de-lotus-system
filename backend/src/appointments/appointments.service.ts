import { BadRequestException, Injectable } from '@nestjs/common';
import type { Customer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: CreateAppointmentDto, authenticatedCustomerId?: string) {
    const {
      serviceIds,
      date,
      startTime,
      customerName,
      customerPhone,
      customerEmail,
      imageUrl,
      notes,
    } = data;

    if (!serviceIds || serviceIds.length === 0) {
      throw new BadRequestException('Selecione pelo menos um serviço.');
    }

    const uniqueServiceIds = [...new Set(serviceIds)];

    const services = await this.prisma.service.findMany({
      where: {
        id: { in: uniqueServiceIds },
        active: true,
      },
    });

    if (services.length !== uniqueServiceIds.length) {
      throw new BadRequestException('Um ou mais serviços são inválidos.');
    }

    const totalDuration = services.reduce(
      (total, service) => total + service.durationMinutes,
      0,
    );

    const appointmentDate = new Date(`${date}T00:00:00`);

    const endTime = this.calculateEndTime(startTime, totalDuration);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        appointmentDate,
        status: {
          in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'],
        },
      },
    });

    const hasConflict = existingAppointments.some((appointment) =>
      this.timeRangesOverlap(
        startTime,
        endTime,
        appointment.startTime,
        appointment.endTime,
      ),
    );

    if (hasConflict) {
      throw new BadRequestException(
        'Este horário não está disponível para a combinação de serviços selecionada.',
      );
    }

    // BLOCO DE RESOLUÇÃO DO CLIENTE
    let customer: Customer;

    if (authenticatedCustomerId) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { id: authenticatedCustomerId },
      });

      if (!existingCustomer) {
        throw new BadRequestException('Cliente autenticado não encontrado.');
      }

      customer = await this.prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
      });
    } else {
      const customerByPhone = await this.prisma.customer.findFirst({
        where: { phone: customerPhone },
      });

      const customerByEmail = await this.prisma.customer.findFirst({
        where: { email: customerEmail },
      });

      if (
        customerByPhone &&
        customerByEmail &&
        customerByPhone.id !== customerByEmail.id
      ) {
        throw new BadRequestException(
          'Já existe um cadastro com esse telefone e outro cadastro com esse email. Faça login com sua conta ou use outro telefone/email.',
        );
      }

      const existingCustomer = customerByPhone ?? customerByEmail;

      customer = existingCustomer
        ? await this.prisma.customer.update({
            where: { id: existingCustomer.id },
            data: {
              name: customerName,
              phone: customerPhone,
              email: customerEmail,
            },
          })
        : await this.prisma.customer.create({
            data: {
              name: customerName,
              phone: customerPhone,
              email: customerEmail,
            },
          });
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        customerId: customer.id,
        appointmentDate,
        startTime,
        endTime,
        status: 'PENDING',
        imageUrl,
        notes,
        services: {
          create: uniqueServiceIds.map((serviceId) => ({
            service: {
              connect: { id: serviceId },
            },
          })),
        },
      },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    // ✅ ENVIAR E-MAILS
    try {
      const serviceNames = appointment.services
        .map((item) => item.service?.name)
        .filter((name): name is string => Boolean(name));

      await this.mailService.sendNewAppointmentToAdmin({
        customerName,
        customerPhone,
        customerEmail,
        date,
        startTime,
        serviceNames,
        notes,
        imageUrl,
      });

      await this.mailService.sendAppointmentCreatedToClient({
        customerName,
        customerEmail,
        date,
        startTime,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mails:', error);
    }

    return appointment;
  }

  // ✅ CONFIRM com e-mail (com verificação de e-mail)
  async confirm(id: string) {
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    const formattedDate =
      appointment.appointmentDate.toLocaleDateString('pt-BR');

    // ✅ Verificar se o cliente tem e-mail antes de enviar
    if (appointment.customer.email) {
      try {
        await this.mailService.sendAppointmentConfirmedToClient({
          customerName: appointment.customer.name,
          customerEmail: appointment.customer.email,
          date: formattedDate,
          startTime: appointment.startTime,
        });
      } catch (error) {
        console.error('Erro ao enviar e-mail de confirmação:', error);
      }
    } else {
      console.log(
        `Cliente ${appointment.customer.name} não possui e-mail cadastrado. E-mail de confirmação não enviado.`,
      );
    }

    return appointment;
  }

  // ✅ CANCEL com e-mail (com verificação de e-mail)
  async cancel(id: string) {
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    const formattedDate =
      appointment.appointmentDate.toLocaleDateString('pt-BR');

    // ✅ Verificar se o cliente tem e-mail antes de enviar
    if (appointment.customer.email) {
      try {
        await this.mailService.sendAppointmentCancelledToClient({
          customerName: appointment.customer.name,
          customerEmail: appointment.customer.email,
          date: formattedDate,
          startTime: appointment.startTime,
        });
      } catch (error) {
        console.error('Erro ao enviar e-mail de cancelamento:', error);
      }
    } else {
      console.log(
        `Cliente ${appointment.customer.name} não possui e-mail cadastrado. E-mail de cancelamento não enviado.`,
      );
    }

    return appointment;
  }

  async completeAppointment(id: string, finalPrice?: number) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        finalPrice: finalPrice ?? null,
      },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  // ✅ MARK NO SHOW com e-mail (com verificação de e-mail)
  async markNoShow(id: string) {
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'NO_SHOW',
      },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    const formattedDate =
      appointment.appointmentDate.toLocaleDateString('pt-BR');

    // ✅ Verificar se o cliente tem e-mail antes de enviar
    if (appointment.customer.email) {
      try {
        await this.mailService.sendAppointmentNoShowToClient({
          customerName: appointment.customer.name,
          customerEmail: appointment.customer.email,
          date: formattedDate,
          startTime: appointment.startTime,
        });
      } catch (error) {
        console.error('Erro ao enviar e-mail de não comparecimento:', error);
      }
    } else {
      console.log(
        `Cliente ${appointment.customer.name} não possui e-mail cadastrado. E-mail de não comparecimento não enviado.`,
      );
    }

    return appointment;
  }

  async deleteAppointment(id: string) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  // ✅ RESCHEDULE com e-mail (com verificação de e-mail)
  async reschedule(id: string, date: string, startTime: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new BadRequestException('Agendamento não encontrado.');
    }

    const appointmentDate = new Date(`${date}T00:00:00`);

    const totalDuration = appointment.services.reduce(
      (total, item) => total + item.service.durationMinutes,
      0,
    );

    const endTime = this.calculateEndTime(startTime, totalDuration);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        id: { not: id },
        appointmentDate,
        status: {
          in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'],
        },
      },
    });

    const hasConflict = existingAppointments.some((existingAppointment) =>
      this.timeRangesOverlap(
        startTime,
        endTime,
        existingAppointment.startTime,
        existingAppointment.endTime,
      ),
    );

    if (hasConflict) {
      throw new BadRequestException('Este horário já está ocupado.');
    }

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate,
        startTime,
        endTime,
        status: 'RESCHEDULED',
      },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    const formattedDate =
      updatedAppointment.appointmentDate.toLocaleDateString('pt-BR');

    // ✅ Verificar se o cliente tem e-mail antes de enviar
    if (updatedAppointment.customer.email) {
      try {
        await this.mailService.sendAppointmentRescheduledToClient({
          customerName: updatedAppointment.customer.name,
          customerEmail: updatedAppointment.customer.email,
          date: formattedDate,
          startTime: updatedAppointment.startTime,
        });
      } catch (error) {
        console.error('Erro ao enviar e-mail de reagendamento:', error);
      }
    } else {
      console.log(
        `Cliente ${updatedAppointment.customer.name} não possui e-mail cadastrado. E-mail de reagendamento não enviado.`,
      );
    }

    return updatedAppointment;
  }

  async analyzeAppointment(
    id: string,
    data: {
      estimatedMin?: number;
      estimatedMax?: number;
      evaluationNotes?: string;
    },
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new BadRequestException('Agendamento não encontrado.');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        estimatedMin: data.estimatedMin ?? null,
        estimatedMax: data.estimatedMax ?? null,
        evaluationNotes: data.evaluationNotes ?? null,
        analyzedAt: new Date(),
      },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async getDashboardStats() {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const totalCustomers = await this.prisma.customer.count();

    const [
      todayCount,
      pendingCount,
      weekCount,
      monthAppointments,
      confirmedToday,
      confirmedWeek,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),
      this.prisma.appointment.count({
        where: {
          status: 'PENDING',
        },
      }),
      this.prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          appointmentDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          status: 'COMPLETED',
        },
        include: {
          services: {
            include: {
              service: true,
            },
          },
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          appointmentDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
          status: 'COMPLETED',
        },
        include: {
          services: {
            include: {
              service: true,
            },
          },
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          appointmentDate: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
          status: 'COMPLETED',
        },
        include: {
          services: {
            include: {
              service: true,
            },
          },
        },
      }),
    ]);

    const getAppointmentTotal = (appointment: {
      finalPrice?: number | null;
      services: Array<{
        service: {
          price: unknown;
        };
      }>;
    }) => {
      if (appointment.finalPrice != null) {
        return Number(appointment.finalPrice);
      }

      return appointment.services.reduce((total, item) => {
        return total + Number(item.service?.price ?? 0);
      }, 0);
    };

    const monthRevenue = monthAppointments.reduce((total, appointment) => {
      return total + getAppointmentTotal(appointment);
    }, 0);

    const todayRevenue = confirmedToday.reduce((total, appointment) => {
      return total + getAppointmentTotal(appointment);
    }, 0);

    const weekRevenue = confirmedWeek.reduce((total, appointment) => {
      return total + getAppointmentTotal(appointment);
    }, 0);

    return {
      todayCount,
      pendingCount,
      weekCount,
      monthRevenue,
      todayRevenue,
      weekRevenue,
      totalCustomers,
    };
  }

  async getTodaySchedule() {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const businessSettings = await this.prisma.businessSetting.findFirst();

    const workingHoursStart = businessSettings?.workingHoursStart || '09:00';
    const workingHoursEnd = businessSettings?.workingHoursEnd || '18:00';
    const durationMinutes = businessSettings?.defaultDurationMinutes || 60;

    const slots = this.generateTimeSlots(
      workingHoursStart,
      workingHoursEnd,
      durationMinutes,
    );

    return slots.map((slot) => {
      const appointment = appointments.find((item) => item.startTime === slot);

      return {
        time: slot,
        appointment: appointment ?? null,
      };
    });
  }

  async getNotifications() {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const pendingAppointments = await this.prisma.appointment.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const todayAppointments = await this.prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
        status: {
          in: ['CONFIRMED', 'RESCHEDULED'],
        },
      },
      include: {
        customer: true,
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const overdueAppointments = todayAppointments.filter((appointment) => {
      const [hours, minutes] = appointment.startTime.split(':').map(Number);
      const appointmentDateTime = new Date(appointment.appointmentDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      return appointmentDateTime < now;
    });

    const notifications: Array<{
      type: string;
      title: string;
      description: string;
    }> = [];

    if (pendingAppointments.length > 0) {
      notifications.push({
        type: 'pending',
        title: 'Solicitações pendentes',
        description: `Você tem ${pendingAppointments.length} solicitação(ões) aguardando confirmação.`,
      });
    }

    if (todayAppointments.length > 0) {
      notifications.push({
        type: 'today',
        title: 'Atendimentos agendados para hoje',
        description: `Hoje há ${todayAppointments.length} atendimento(s) confirmado(s) ou reagendado(s).`,
      });
    }

    if (overdueAppointments.length > 0) {
      notifications.push({
        type: 'overdue',
        title: 'Atendimentos aguardando conclusão',
        description: `${overdueAppointments.length} atendimento(s) de hoje já passaram do horário e ainda não foram concluídos.`,
      });
    }

    return notifications;
  }

  private generateTimeSlots(
    start: string,
    end: string,
    durationMinutes: number,
  ): string[] {
    const slots: string[] = [];

    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    while (currentMinutes + durationMinutes <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60)
        .toString()
        .padStart(2, '0');
      const minutes = (currentMinutes % 60).toString().padStart(2, '0');

      slots.push(`${hours}:${minutes}`);
      currentMinutes += durationMinutes;
    }

    return slots;
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);

    const totalMinutes = hours * 60 + minutes + durationMinutes;

    const endHours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, '0');

    const endMinutes = (totalMinutes % 60).toString().padStart(2, '0');

    return `${endHours}:${endMinutes}`;
  }

  private timeRangesOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ): boolean {
    const startAMinutes = this.timeToMinutes(startA);
    const endAMinutes = this.timeToMinutes(endA);
    const startBMinutes = this.timeToMinutes(startB);
    const endBMinutes = this.timeToMinutes(endB);

    return startAMinutes < endBMinutes && endAMinutes > startBMinutes;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
