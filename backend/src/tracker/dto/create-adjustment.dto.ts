import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateAdjustmentDto {
  @IsString()
  trackerProductId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}
