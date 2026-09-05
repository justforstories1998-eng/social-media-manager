import { IsString, IsNumber, IsArray, ValidateNested, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'] as const;

export class FxRateItemDto {
  @ApiProperty({ enum: SUPPORTED_CURRENCIES })
  @IsString()
  @IsIn([...SUPPORTED_CURRENCIES])
  currency!: string;

  @ApiProperty({ example: 83.2 })
  @IsNumber()
  @Min(0.000001)
  rateToUSD!: number;
}

export class UpdateFxRatesDto {
  @ApiProperty({ type: [FxRateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FxRateItemDto)
  rates!: FxRateItemDto[];
}
