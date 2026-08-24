import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ComboOffersService } from './combo-offers.service';
import { AIService } from '../ai/ai.service';
import { CreateComboOfferDto } from './dto/create-combo-offer.dto';
import { UpdateComboOfferDto } from './dto/update-combo-offer.dto';
import { AnalyzeProductsDto } from './dto/analyze-products.dto';

@Controller('combo-offers')
@UseGuards(JwtAuthGuard)
export class ComboOffersController {
  constructor(
    private readonly comboOffersService: ComboOffersService,
    private readonly aiService: AIService,
  ) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateComboOfferDto) {
    return this.comboOffersService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.comboOffersService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.comboOffersService.findById(id, req.user.id);
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateComboOfferDto,
  ) {
    return this.comboOffersService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.comboOffersService.delete(id, req.user.id);
  }

  @Post('analyze')
  async analyzeProducts(
    @Request() req: any,
    @Body() dto: AnalyzeProductsDto,
  ) {
    return this.comboOffersService.analyzeProducts(req.user.id, dto.productIds);
  }

  @Post(':id/generate-prompt')
  async generateImagePrompt(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.comboOffersService.generateImagePrompt(req.user.id, id);
  }

  @Post(':id/generate-image')
  async generateImage(@Request() req: any, @Param('id') id: string) {
    const combo = await this.comboOffersService.findById(id, req.user.id);

    if (!combo.imagePrompt) {
      throw new BadRequestException('Generate a prompt first');
    }

    const result = await this.aiService.generateImage(
      combo.imagePrompt,
      'flux',
      1024,
      1024,
    );

    await this.comboOffersService.update(id, req.user.id, {
      imageUrl: result.imageUrl,
      status: 'generated',
    });

    return { ...result, comboOfferId: id };
  }
}
