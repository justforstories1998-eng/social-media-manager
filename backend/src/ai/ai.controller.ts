import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private aiService: AIService) {}

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

  @Post('generate-ad-concepts')
  async generateAdConcepts(@Body() body: { productName: string; category?: string; description?: string; imageUrl?: string }) {
    return this.aiService.generateAdConcepts(body.productName, body.category || '', body.description || '', body.imageUrl);
  }

  @Post('generate-ad-image')
  async generateAdImage(@Body() body: { prompt: string; width?: number; height?: number }) {
    return this.aiService.generateAdImage(body.prompt, body.width, body.height);
  }

  @Post('generate-image')
  async generateImage(@Body() body: { prompt: string; model?: string; width?: number; height?: number; seed?: number }) {
    return this.aiService.generateImage(body.prompt, body.model, body.width, body.height, body.seed);
  }

  @Post('generate-video')
  async generateVideo(@Body() body: { prompt: string; model?: string; duration?: number }) {
    return this.aiService.generateVideo(body.prompt, body.model, body.duration);
  }

  @Get('models')
  async getAvailableModels() {
    return this.aiService.getAvailableModels();
  }
}
