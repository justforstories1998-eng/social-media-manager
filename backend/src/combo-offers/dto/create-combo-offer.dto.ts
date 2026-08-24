import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateComboOfferDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  discount?: string;

  @IsNumber()
  @IsOptional()
  comboPrice?: number;

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  visualStyle?: string;

  @IsString()
  @IsOptional()
  objective?: string;

  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}
