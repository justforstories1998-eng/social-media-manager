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
  async generate(@Request() req, @Body() body: { prompt: string; type: string; platform?: string }) {
    return this.aiService.generateContent(body.prompt, body.type, req.user.id);
  }

  @Post('generate-post')
  async generateFullPost(@Request() req, @Body() body: { prompt: string; platform: string; type: string }) {
    return this.aiService.generateFullPost(body.prompt, body.platform, body.type, req.user.id);
  }

  @Post('generate-image')
  async generateImage(@Request() req, @Body() body: { prompt: string; brandColors?: string[] }) {
    return this.aiService.generateImagePrompt(body.prompt, req.user.id, body.brandColors);
  }

  @Post('daily-content')
  async generateDaily(@Request() req) {
    return this.aiService.generateDailyContent(req.user.id, {}, []);
  }

  @Get('models')
  async getAvailableModels() {
    return this.aiService.getAvailableModels();
  }
}