import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AIGenerationService } from './ai-generation.service';
import { CreateAIGenerationDto } from './dto/create-ai-generation.dto';
import { UpdateAIGenerationDto } from './dto/update-ai-generation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('ai-generations')
@ApiBearerAuth()
@Controller('ai-generations')
@UseGuards(JwtAuthGuard)
export class AIGenerationController {
  constructor(private readonly aiGenerationService: AIGenerationService) {}

  @Get()
  @ApiQuery({ name: 'type', required: false })
  async findAll(@Request() req: any, @Query('type') type?: string) {
    return this.aiGenerationService.findByUser(req.user.id, type);
  }

  @Get('product/:productId')
  async findByProduct(@Request() req: any, @Param('productId') productId: string) {
    return this.aiGenerationService.findByProduct(productId, req.user.id);
  }

  @Get('post/:postId')
  async findByPost(@Request() req: any, @Param('postId') postId: string) {
    return this.aiGenerationService.findByPost(postId, req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.aiGenerationService.findById(id, req.user.id);
  }

  @Post()
  async create(@Request() req: any, @Body() createDto: CreateAIGenerationDto) {
    return this.aiGenerationService.create(req.user.id, createDto);
  }

  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateAIGenerationDto,
  ) {
    return this.aiGenerationService.update(id, req.user.id, updateDto);
  }
}
