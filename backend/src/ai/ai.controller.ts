import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIGenerationService } from '../ai-generation/ai-generation.service';
import { HuggingFaceProvider } from './providers/huggingface.provider';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import axios from 'axios';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private aiService: AIService,
    private aiGenerationService: AIGenerationService,
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
  async generateAdImage(@Body() body: { prompt: string; width?: number; height?: number }) {
    return this.aiService.generateAdImage(body.prompt, body.width, body.height);
  }

  @Post('generate-image')
  async generateImage(
    @Request() req: any,
    @Body() body: { prompt: string; model?: string; width?: number; height?: number; seed?: number; productId?: string },
  ) {
    let generation;
    try {
      generation = await this.aiGenerationService.create(req.user.id, {
        productId: body.productId,
        type: 'image',
        prompt: body.prompt,
        model: body.model,
        provider: 'huggingface',
        width: body.width,
        height: body.height,
        seed: body.seed,
      });

      await this.aiGenerationService.update(generation.id, req.user.id, { status: 'processing' });
      const result = await this.aiService.generateImage(body.prompt, body.model, body.width, body.height, body.seed);

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

  @Post('generate-video')
  async generateVideo(
    @Request() req: any,
    @Body() body: { prompt: string; model?: string; duration?: number; productId?: string },
  ) {
    const generation = await this.aiGenerationService.create(req.user.id, {
      productId: body.productId,
      type: 'video',
      prompt: body.prompt,
      model: body.model,
      provider: 'huggingface',
      duration: body.duration,
    });

    try {
      await this.aiGenerationService.update(generation.id, req.user.id, { status: 'processing' });
      const result = await this.aiService.generateVideo(body.prompt, body.model, body.duration);

      await this.aiGenerationService.update(generation.id, req.user.id, {
        status: 'completed',
        outputUrl: result.videoUrl,
        outputData: result,
      });

      return { generation, result };
    } catch (error) {
      await this.aiGenerationService.update(generation.id, req.user.id, {
        status: 'failed',
        error: error.message,
      });
      throw error;
    }
  }

  @Get('models')
  async getAvailableModels() {
    return this.aiService.getAvailableModels();
  }

  @Get('test-image-api')
  async testImageApi() {
    const results: any = {};

    // Test huggingface.co
    try {
      await axios.get('https://huggingface.co', { timeout: 10000 });
      results.huggingface = 'reachable';
    } catch (e: any) {
      results.huggingface = e.message;
    }

    // Test router.huggingface.co
    try {
      await axios.get('https://router.huggingface.co', { timeout: 10000 });
      results.router = 'reachable';
    } catch (e: any) {
      results.router = e.message;
    }

    // Test api-inference.huggingface.co
    try {
      await axios.get('https://api-inference.huggingface.co', { timeout: 10000 });
      results.apiInference = 'reachable';
    } catch (e: any) {
      results.apiInference = e.message;
    }

    // Check API key
    results.hasApiKey = !!(process.env.HUGGINGFACE_API_KEY);

    return results;
  }
}
