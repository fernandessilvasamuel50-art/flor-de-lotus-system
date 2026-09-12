import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AdminJwtAuthGuard } from '../common/guards/admin-jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // Público
  @Get()
  async findAll() {
    return this.servicesService.findAll();
  }

  // Admin
  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/all')
  async findAllForAdmin() {
    return this.servicesService.findAllForAdmin();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post()
  async create(@Body() data: CreateServiceDto) {
    return this.servicesService.create(data);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateServiceDto) {
    return this.servicesService.update(id, data);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
