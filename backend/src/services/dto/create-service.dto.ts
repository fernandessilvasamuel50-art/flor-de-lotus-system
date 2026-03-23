import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number | null;

  @IsString()
  @IsOptional()
  priceText?: string | null;

  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresImage?: boolean;
}