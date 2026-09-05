import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIGenerationService } from '../ai-generation/ai-generation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
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
    @Body() body: { prompt: string; model?: string; width?: number; height?: number; seed?: number; productId?: string },
  ) {
    let generation: any;
    try {
      let productData: any = undefined;
      if (body.productId) {
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
      }

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
        await this.aiGenerationService.update(generation.id, req.user.id, { status: 'processing' });
      } catch (genError: any) {
        console.error('Failed to create AI generation record:', genError.message);
      }

      const result = await Promise.race([
        this.aiService.generateImage(body.prompt, body.model, body.width, body.height, body.seed, productData),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Image generation timed out after 180s')), 180000)),
      ]) as any;

      if (generation) {
        await this.aiGenerationService.update(generation.id, req.user.id, {
          status: 'completed',
          outputUrl: result.imageUrl,
          outputData: result,
        }).catch(() => {});
      }

      return { generation, result };
    } catch (error: any) {
      if (generation) {
        await this.aiGenerationService.update(generation.id, req.user.id, {
          status: 'failed',
          error: error.message,
        }).catch(() => {});
      }
      console.error('generate-image error:', error.message, error.stack);
      return { error: error.message, stack: error.stack?.substring(0, 200) };
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
