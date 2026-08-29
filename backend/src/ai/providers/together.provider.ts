import { Injectable, Logger } from '@nestjs/common';
import { ImageProvider } from './image-provider.interface';
import { VideoProvider } from './video-provider.interface';
import axios from 'axios';

@Injectable()
export class TogetherProvider implements ImageProvider, VideoProvider {
  name = 'pollinations';
  private readonly logger = new Logger(TogetherProvider.name);

  private imageModels = [
    { id: 'flux', name: 'FLUX', description: 'High-quality image generation' },
    { id: 'flux-realism', name: 'FLUX Realism', description: 'Photorealistic images' },
    { id: 'flux-anime', name: 'FLUX Anime', description: 'Anime-style generation' },
  ];

  private videoModels = [
    { id: 'stable-video', name: 'Stable Video', description: 'Text-to-video generation' },
  ];

  async isAvailable(): Promise<boolean> {
    return true; // Always available — no API key needed
  }

  async generateImage(params: {
    prompt: string;
    model?: string;
    width?: number;
    height?: number;
    seed?: number;
  }): Promise<{ imageUrl: string; model: string; provider: string }> {
    const { prompt, model = 'flux', width = 1024, height = 1024, seed } = params;

    const enhancedPrompt = this.enhancePrompt(prompt);
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const seedParam = seed ? `&seed=${seed}` : `&seed=${Math.floor(Math.random() * 1000000)}`;

    // Use pollinations.ai — completely free, no API key
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&width=${width}&height=${height}${seedParam}&nologo=true&enhance=true`;

    this.logger.log(`Generated image URL: ${imageUrl.substring(0, 80)}...`);

    return { imageUrl, model, provider: 'pollinations' };
  }

  async generateVideo(params: {
    prompt: string;
    model?: string;
    duration?: number;
  }): Promise<{ videoUrl: string; model: string; provider: string }> {
    const { prompt, model = 'stable-video', duration = 5 } = params;

    const enhancedPrompt = this.enhancePrompt(prompt);
    const encodedPrompt = encodeURIComponent(enhancedPrompt);

    const videoUrl = `https://video.pollinations.ai/prompt/${encodedPrompt}?model=${model}&duration=${duration}`;

    return { videoUrl, model, provider: 'pollinations' };
  }

  async generate(params: {
    prompt: string;
    model?: string;
    width?: number;
    height?: number;
    seed?: number;
  }): Promise<{ imageUrl: string; model: string; provider: string }> {
    return this.generateImage(params);
  }

  getModels(): Array<{ id: string; name: string; description: string }> {
    return this.imageModels;
  }

  getVideoModels(): Array<{ id: string; name: string; description: string }> {
    return this.videoModels;
  }

  private enhancePrompt(prompt: string): string {
    const qualityModifiers = ['masterpiece', 'best quality', 'highly detailed', 'professional', 'sharp focus', '8k', 'photorealistic', 'studio lighting'];
    const hasQuality = qualityModifiers.some(m => prompt.toLowerCase().includes(m.toLowerCase()));
    if (hasQuality) return prompt;
    return `${prompt}, masterpiece, best quality, highly detailed, professional photography, sharp focus, 8k resolution, studio lighting, cinematic, vivid colors, product photography`;
  }
}
