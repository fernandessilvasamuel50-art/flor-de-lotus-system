import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableSlots(date: string, serviceIds: string[]) {
    if (!date) {
      throw new BadRequestException('A data é obrigatória.');
    }

    const targetDate = new Date(`${date}T00:00:00`);

    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Data inválida.');
    }

    const dayOfWeek = targetDate.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        date,
        allSlots: [],
        availableSlots: [],
        message: 'O espaço atende apenas de segunda a sexta.',
      };
    }

    const businessSettings = await this.prisma.businessSetting.findFirst();

    const workingHoursStart = businessSettings?.workingHoursStart || '09:00';
    const workingHoursEnd = businessSettings?.workingHoursEnd || '18:00';

    let durationMinutes = 60;

    if (serviceIds.length > 0) {
      const services = await this.prisma.service.findMany({
        where: {
          id: { in: serviceIds },
        },
      });

      durationMinutes = services.reduce(
        (total, service) => total + service.durationMinutes,
        0,
      );
    } else {
      const businessSettings = await this.prisma.businessSetting.findFirst();
      durationMinutes = businessSettings?.defaultDurationMinutes || 60;
    }

    const allSlots = this.generateTimeSlots(
      workingHoursStart,
      workingHoursEnd,
      durationMinutes,
    );

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    function timeToMinutes(time: string) {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    }

    const availableSlots = allSlots.filter((slot) => {
      const slotStart = timeToMinutes(slot);
      const slotEnd = slotStart + durationMinutes;

      return !appointments.some((appointment) => {
        const appointmentStart = timeToMinutes(appointment.startTime);

        const appointmentDuration = appointment.services.reduce(
          (total, item) => total + item.service.durationMinutes,
          0,
        );

        const appointmentEnd = appointmentStart + appointmentDuration;

        const overlap =
          slotStart < appointmentEnd && slotEnd > appointmentStart;

        return overlap;
      });
    });

    return {
      date,
      allSlots,
      availableSlots,
    };
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
}
