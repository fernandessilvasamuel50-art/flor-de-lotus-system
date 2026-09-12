import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  name?: string;

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
  @IsOptional()
  durationMinutes?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresImage?: boolean;
}
