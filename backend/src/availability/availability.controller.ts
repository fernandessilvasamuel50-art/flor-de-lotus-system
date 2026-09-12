import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  async getAvailability(
    @Query('date') date: string,
    @Query('serviceIds') serviceIds?: string,
  ) {
    const parsedServiceIds = serviceIds
      ? serviceIds.split(',').filter(Boolean)
      : [];

    return this.availabilityService.getAvailableSlots(date, parsedServiceIds);
  }
}
