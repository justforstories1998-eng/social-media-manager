import { Injectable, Logger } from '@nestjs/common';
import { ImageProvider } from './image-provider.interface';
import { VideoProvider } from './video-provider.interface';
import axios from 'axios';

@Injectable()
export class HuggingFaceProvider implements ImageProvider, VideoProvider {
  name = 'together';
  private readonly logger = new Logger(HuggingFaceProvider.name);
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TOGETHER_API_KEY || process.env.HUGGINGFACE_API_KEY || '';
  }

  private imageModels = [
    { id: 'black-forest-labs/FLUX.1-schnell-Free', name: 'FLUX.1 Schnell', description: 'Fast, high-quality image generation (free)' },
    { id: 'black-forest-labs/FLUX.1-dev', name: 'FLUX.1 Dev', description: 'High-quality FLUX development model' },
    { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL', description: 'Photorealistic, strong composition' },
  ];

  private videoModels = [
    { id: 'Wan-AI/Wan2.2-T2V-A14B', name: 'Wan 2.2 Text-to-Video', description: 'Best free text-to-video generation' },
  ];

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async generateImage(params: {
    prompt: string;
    model?: string;
    width?: number;
    height?: number;
    seed?: number;
  }): Promise<{ imageUrl: string; model: string; provider: string }> {
    const { prompt, model = 'black-forest-labs/FLUX.1-schnell-Free', width = 1024, height = 1024 } = params;

    if (!this.apiKey) {
      throw new Error('TOGETHER_API_KEY is not set. Get one free at together.ai — $5 credit included.');
    }

    const enhancedPrompt = this.enhancePrompt(prompt);

    try {
      this.logger.log(`Generating image with Together AI: ${model}`);
      const response = await axios.post(
        'https://api.together.xyz/v1/images/generations',
        {
          model,
          prompt: enhancedPrompt,
          width,
          height,
          n: 1,
          response_format: 'b64_json',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 90000,
        }
      );

      const b64 = response.data.data[0].b64_json;
      const imageUrl = `data:image/png;base64,${b64}`;

      this.logger.log(`Image generated successfully with ${model}`);
      return { imageUrl, model, provider: 'together' };
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.message;
      this.logger.error(`Together AI image generation failed (${model}): ${msg}`);
      throw new Error(`Image generation failed: ${msg}`);
    }
  }

  async generateVideo(params: {
    prompt: string;
    model?: string;
    duration?: number;
  }): Promise<{ videoUrl: string; model: string; provider: string }> {
    const { prompt } = params;

    if (!this.apiKey) {
      throw new Error('TOGETHER_API_KEY is not set.');
    }

    throw new Error('Video generation not available on Together AI free tier. Try HuggingFace Wan 2.2 models instead.');
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
    const qualityModifiers = ['masterpiece', 'best quality', 'highly detailed', 'professional', 'sharp focus', '8k'];
    const hasQuality = qualityModifiers.some(m => prompt.toLowerCase().includes(m.toLowerCase()));
    if (hasQuality) return prompt;
    return `${prompt}, masterpiece, best quality, highly detailed, professional, sharp focus, cinematic lighting, vivid colors`;
  }
}
