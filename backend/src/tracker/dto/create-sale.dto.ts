import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleDto {
  @ApiProperty()
  @IsString()
  trackerProductId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  saleDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isReturn?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  returnReason?: string;
}
