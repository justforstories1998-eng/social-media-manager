import { Controller, Post, Body, UseGuards, Request, Get, Logger } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIGenerationService } from '../ai-generation/ai-generation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GenerateImageDto } from './dto/generate-image.dto';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  private readonly logger = new Logger(AIController.name);

  constructor(
    private aiService: AIService,
    private aiGenerationService: AIGenerationService,
    private prisma: PrismaService,
  ) {}

  @Post('generate')
  async generate(@Request() req, @Body() body: { prompt: string; type: string; platform?: string; model?: string }) {
    return this.aiService.generateContent(body.prompt, body.type, req.user.id, body.model);
  }

  @Post('generate-post')
  async generateFullPost(@Request() req, @Body() body: { prompt: string; platform: string; type: string; model?: string }) {
    return this.aiService.generateFullPost(body.prompt, body.platform, body.type, req.user.id, body.model);
  }

  @Post('generate-image-prompt')
  async generateImagePrompt(@Request() req, @Body() body: { prompt: string; brandColors?: string[]; model?: string }) {
    return this.aiService.generateImagePrompt(body.prompt, req.user.id, body.brandColors, body.model);
  }

  @Post('daily-content')
  async generateDaily(@Request() req) {
    return this.aiService.generateDailyContent(req.user.id, {}, []);
  }

  @Post('recommendations')
  async getRecommendations(@Request() req, @Body() body?: { date?: string }) {
    return this.aiService.generateRecommendations(req.user.id, body?.date);
  }

  @Post('generate-ad-concepts')
  async generateAdConcepts(@Body() body: { productName: string; category?: string; description?: string; imageUrl?: string }) {
    return this.aiService.generateAdConcepts(body.productName, body.category || '', body.description || '', body.imageUrl);
  }

  @Post('generate-ad-image')
  async generateAdImage(@Body() body: { prompt: string; width?: number; height?: number; productId?: string }) {
    let productData: any = undefined;
    if (body.productId) {
      const product = await this.prisma.product.findFirst({
        where: { id: body.productId },
      });
      if (product) {
        productData = {
          name: product.name,
          description: product.description || undefined,
          category: product.category || undefined,
          imageUrl: product.images?.[0] || undefined,
          features: product.features || [],
        };
      }
    }
    return this.aiService.generateAdImage(body.prompt, body.width, body.height, productData);
  }

  @Post('generate-image')
  async generateImage(
    @Request() req: any,
    @Body() body: GenerateImageDto,
  ) {
    try {
      this.logger.log(`generate-image called: prompt="${(body.prompt || '').substring(0, 50)}", model=${body.model}, productId=${body.productId}`);

      let productData: any = undefined;
      if (body.productId) {
        try {
          const product = await this.prisma.product.findFirst({
            where: { id: body.productId, userId: req.user.id },
          });
          if (product) {
            productData = {
              name: product.name,
              description: product.description || undefined,
              category: product.category || undefined,
              imageUrl: product.images?.[0] || undefined,
              features: product.features || [],
            };
          }
        } catch (e: any) {
          this.logger.warn(`Product lookup failed: ${e.message}`);
        }
      }

      this.logger.log('Calling aiService.generateImage...');
      const result = await this.aiService.generateImage(body.prompt, body.model, body.width, body.height, body.seed, productData);
      this.logger.log('aiService.generateImage returned successfully');

      let generation: any = null;
      try {
        generation = await this.aiGenerationService.create(req.user.id, {
          productId: body.productId,
          type: 'image',
          prompt: body.prompt,
          model: body.model,
          provider: 'nvidia',
          width: body.width,
          height: body.height,
          seed: body.seed,
        });
        await this.aiGenerationService.update(generation.id, req.user.id, {
          status: 'completed',
          outputUrl: result.imageUrl,
          outputData: result,
        }).catch((e: any) => this.logger.warn(`Generation update failed: ${e?.message}`));
      } catch (e: any) {
        this.logger.warn(`Generation record failed: ${e.message}`);
      }

      return { generation, result };
    } catch (error: any) {
      this.logger.error(`generate-image error: ${error.message}`, error.stack);
      return { generation: null, result: null, error: error.message || 'Image generation failed' };
    }
  }

  @Get('models')
  async getAvailableModels() {
    return this.aiService.getAvailableModels();
  }

  @Post('chat')
  async chat(@Request() req, @Body() body: { message: string; history?: Array<{ role: string; content: string }> }) {
    return this.aiService.chat(body.message, req.user.id, body.history);
  }

}
