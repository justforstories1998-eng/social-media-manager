import { IsArray, IsString } from 'class-validator';

export class AnalyzeProductsDto {
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}
