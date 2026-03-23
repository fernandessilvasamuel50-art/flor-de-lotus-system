export class CreateAppointmentDto {
  serviceIds: string[];
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  imageUrl?: string;
  notes?: string;
}