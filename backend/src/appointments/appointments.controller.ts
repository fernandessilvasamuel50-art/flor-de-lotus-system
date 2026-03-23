import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AnalyzeAppointmentDto } from './dto/analyze-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  async findAll() {
    return this.appointmentsService.findAll();
  }

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.appointmentsService.getDashboardStats();
  }

  @Get('dashboard/today-schedule')
  async getTodaySchedule() {
    return this.appointmentsService.getTodaySchedule();
  }

  @Get('dashboard/notifications')
  async getNotifications() {
    return this.appointmentsService.getNotifications();
  }

  @Post()
  async create(
    @Body() data: CreateAppointmentDto,
    @Headers('authorization') authorization?: string,
  ) {
    let authenticatedCustomerId: string | undefined;

    if (authorization?.startsWith('Bearer ')) {
      try {
        const token = authorization.replace('Bearer ', '');
        const payload = await this.jwtService.verifyAsync(token);

        if (payload?.role === 'customer' && payload?.sub) {
          authenticatedCustomerId = payload.sub;
        }
      } catch (error) {
        console.log(
          'Token de cliente inválido, expirado ou incompatível. Seguindo como solicitação pública.',
        );
      }
    }

    return this.appointmentsService.create(data, authenticatedCustomerId);
  }

  @Patch(':id/confirm')
  async confirm(@Param('id') id: string) {
    return this.appointmentsService.confirm(id);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }

  @Patch(':id/complete')
  async completeAppointment(
    @Param('id') id: string,
    @Body() body: { finalPrice?: number },
  ) {
    return this.appointmentsService.completeAppointment(id, body.finalPrice);
  }

  @Patch(':id/no-show')
  async markNoShow(@Param('id') id: string) {
    return this.appointmentsService.markNoShow(id);
  }

  @Patch(':id/delete')
  async deleteAppointment(@Param('id') id: string) {
    return this.appointmentsService.deleteAppointment(id);
  }

  @Patch(':id/reschedule')
  async reschedule(
    @Param('id') id: string,
    @Body() body: { date: string; startTime: string },
  ) {
    return this.appointmentsService.reschedule(id, body.date, body.startTime);
  }

  @Patch(':id/analyze')
  async analyze(
    @Param('id') id: string,
    @Body() data: AnalyzeAppointmentDto,
  ) {
    return this.appointmentsService.analyzeAppointment(id, data);
  }
}