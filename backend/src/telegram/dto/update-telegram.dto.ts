import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTelegramDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  botToken?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  chatId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  channelId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
