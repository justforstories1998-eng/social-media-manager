import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAIGenerationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  postId?: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  prompt: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  revisedPrompt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  seed?: number;
}
