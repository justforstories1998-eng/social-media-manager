import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({ enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'] })
  @IsString()
  @IsOptional()
  @IsIn(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'])
  displayCurrency?: string;
}
