import { Injectable, Logger } from '@nestjs/common';
import { ImageProvider } from './image-provider.interface';
import { VideoProvider } from './video-provider.interface';
import axios from 'axios';

@Injectable()
export class HuggingFaceProvider implements ImageProvider, VideoProvider {
  name = 'huggingface';
  private readonly logger = new Logger(HuggingFaceProvider.name);
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
  }

  private imageModels = [
    { id: 'black-forest-labs/FLUX.1-schnell', name: 'FLUX.1 Schnell', description: 'Fast, high-quality image generation' },
    { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL', description: 'Stable Diffusion XL — photorealistic' },
    { id: 'stabilityai/stable-diffusion-3-medium', name: 'SD3 Medium', description: 'Stable Diffusion 3 — latest architecture' },
  ];

  private videoModels = [
    { id: 'ali-vilab/text-to-video-ms-1.7b', name: 'Text-to-Video', description: 'Text-to-video generation' },
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
    const { prompt, model = 'black-forest-labs/FLUX.1-schnell', width = 1024, height = 1024 } = params;

    if (!this.apiKey) {
      throw new Error('HuggingFace API key not configured. Set HUGGINGFACE_API_KEY environment variable.');
    }

    const enhancedPrompt = this.enhancePrompt(prompt);

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          inputs: enhancedPrompt,
          parameters: {
            width,
            height,
            num_inference_steps: model.includes('FLUX') ? 4 : 30,
            guidance_scale: model.includes('FLUX') ? 0.0 : 7.5,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 60000,
        }
      );

      const base64 = Buffer.from(response.data).toString('base64');
      const imageUrl = `data:image/png;base64,${base64}`;

      return { imageUrl, model, provider: 'huggingface' };
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      this.logger.error(`HuggingFace image generation failed: ${msg}`);

      // If model is loading, wait and retry once
      if (error.response?.status === 503) {
        this.logger.warn('Model is loading, waiting 20s and retrying...');
        await new Promise(r => setTimeout(r, 20000));
        const retryRes = await axios.post(
          `https://api-inference.huggingface.co/models/${model}`,
          { inputs: enhancedPrompt, parameters: { width, height } },
          {
            headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
            responseType: 'arraybuffer',
            timeout: 120000,
          }
        );
        const base64 = Buffer.from(retryRes.data).toString('base64');
        return { imageUrl: `data:image/png;base64,${base64}`, model, provider: 'huggingface' };
      }

      throw error;
    }
  }

  async generateVideo(params: {
    prompt: string;
    model?: string;
    duration?: number;
  }): Promise<{ videoUrl: string; model: string; provider: string }> {
    const { prompt, model = 'ali-vilab/text-to-video-ms-1.7b' } = params;

    if (!this.apiKey) {
      throw new Error('HuggingFace API key not configured.');
    }

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 120000,
      }
    );

    const base64 = Buffer.from(response.data).toString('base64');
    const videoUrl = `data:video/mp4;base64,${base64}`;

    return { videoUrl, model, provider: 'huggingface' };
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
