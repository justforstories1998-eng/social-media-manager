import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateImageDto {
  @ApiProperty({ description: 'Text prompt for image generation' })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ description: 'Model ID (e.g. black-forest-labs/flux.2-klein-4b)' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ description: 'Image width in pixels', default: 1024 })
  @IsNumber()
  @IsOptional()
  @Min(256)
  @Max(2048)
  width?: number;

  @ApiPropertyOptional({ description: 'Image height in pixels', default: 1024 })
  @IsNumber()
  @IsOptional()
  @Min(256)
  @Max(2048)
  height?: number;

  @ApiPropertyOptional({ description: 'Random seed for reproducibility' })
  @IsNumber()
  @IsOptional()
  seed?: number;

  @ApiPropertyOptional({ description: 'Product ID to associate with this generation' })
  @IsString()
  @IsOptional()
  productId?: string;
}
