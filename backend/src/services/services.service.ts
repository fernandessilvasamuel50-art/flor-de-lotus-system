import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  // Público: só ativos
  async findAll() {
    return this.prisma.service.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Admin: todos
  async findAllForAdmin() {
    return this.prisma.service.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async create(data: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price ?? null,
        priceText: data.priceText ?? null,
        durationMinutes: data.durationMinutes,
        active: data.active ?? true,
        requiresImage: data.requiresImage ?? false,
      },
    });
  }

  async update(id: string, data: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado.');
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async remove(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado.');
    }

    const relatedAppointmentsCount = await this.prisma.appointmentService.count(
      {
        where: {
          serviceId: id,
        },
      },
    );

    if (relatedAppointmentsCount > 0) {
      return this.prisma.service.update({
        where: { id },
        data: {
          active: false,
        },
      });
    }

    return this.prisma.service.delete({
      where: { id },
    });
  }
}
