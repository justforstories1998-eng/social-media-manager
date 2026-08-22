import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAIGenerationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsIn(['pending', 'processing', 'completed', 'failed'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  outputUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  outputData?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  error?: string;
}
