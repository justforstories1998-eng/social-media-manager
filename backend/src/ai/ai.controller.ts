import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private configService: ConfigService,
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
    let generation;
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

      const result = await Promise.race([
        this.aiService.generateImage(body.prompt, body.model, body.width, body.height, body.seed, productData),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Image generation timed out after 120s')), 120000)),
      ]) as any;

      await this.aiGenerationService.update(generation.id, req.user.id, {
        status: 'completed',
        outputUrl: result.imageUrl,
        outputData: result,
      });

      return { generation, result };
    } catch (error: any) {
      if (generation) {
        await this.aiGenerationService.update(generation.id, req.user.id, {
          status: 'failed',
          error: error.message,
        }).catch(() => {});
      }
      throw error;
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

  @Get('diagnose')
  async diagnose() {
    const nvidiaKey = this.configService.get('NVIDIA_API_KEY') || '';
    const nvidiaModel = this.configService.get('NVIDIA_MODEL') || 'black-forest-labs/flux.1-schnell';
    const nvidiaUrl = this.configService.get('NVIDIA_API_BASE_URL') || 'https://ai.api.nvidia.com/v1';
    return {
      nvidia_key_set: !!nvidiaKey,
      nvidia_key_prefix: nvidiaKey ? nvidiaKey.substring(0, 8) + '...' : 'NOT SET',
      nvidia_model: nvidiaModel,
      nvidia_url: nvidiaUrl,
      openrouter_key_set: !!this.configService.get('OPENROUTER_API_KEY'),
    };
  }

}
