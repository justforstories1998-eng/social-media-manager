import { Injectable, Logger } from '@nestjs/common';
import { ImageProvider } from './image-provider.interface';
import { VideoProvider } from './video-provider.interface';
import axios from 'axios';

@Injectable()
export class HuggingFaceProvider implements ImageProvider, VideoProvider {
  name = 'huggingface';
  private readonly logger = new Logger(HuggingFaceProvider.name);
  private apiKey: string;
  private apiBase: string;

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
    this.apiBase = process.env.HUGGINGFACE_API_BASE || 'https://router.huggingface.co/hf-inference/models';
  }

  private imageModels = [
    { id: 'black-forest-labs/FLUX.1-schnell', name: 'FLUX.1 Schnell', description: 'Fast, high-quality image generation' },
    { id: 'Qwen/Qwen-Image-2512', name: 'Qwen Image 2512', description: 'High-quality images with text rendering' },
    { id: 'lvladikov/Krea2-Turbo-Distill-4step-LoRA', name: 'Krea2 Turbo', description: 'Fast turbo model, 4-step generation' },
    { id: 'Tongyi-MAI/Z-Image', name: 'Z-Image', description: 'Tongyi creative image generation' },
    { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL', description: 'Photorealistic, strong composition' },
  ];

  private videoModels = [
    { id: 'Wan-AI/Wan2.2-T2V-A14B', name: 'Wan 2.2 Text-to-Video', description: 'Best free text-to-video generation' },
    { id: 'Wan-AI/Wan2.2-TI2V-5B', name: 'Wan 2.2 Text+Image-to-Video', description: 'Text + image to video' },
    { id: 'Wan-AI/Wan2.2-I2V-A14B', name: 'Wan 2.2 Image-to-Video', description: 'Image to video generation' },
  ];

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async testConnection(): Promise<{ ok: boolean; endpoint: string; error?: string }> {
    try {
      const res = await axios.get('https://huggingface.co/api/models?limit=1', { timeout: 10000 });
      return { ok: true, endpoint: 'huggingface.co', error: undefined };
    } catch (e: any) {
      return { ok: false, endpoint: 'huggingface.co', error: e.message };
    }
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
      throw new Error('HUGGINGFACE_API_KEY is not set.');
    }

    const enhancedPrompt = this.enhancePrompt(prompt);

    // Try multiple API base URLs
    const endpoints = [
      'https://router.huggingface.co/hf-inference/models',
      'https://api-inference.huggingface.co/models',
    ];

    let lastError: any;
    for (const baseUrl of endpoints) {
      try {
        this.logger.log(`Trying endpoint: ${baseUrl}/${model}`);
        const response = await axios.post(
          `${baseUrl}/${model}`,
          {
            inputs: enhancedPrompt,
            parameters: {
              width,
              height,
              num_inference_steps: this.getSteps(model),
              guidance_scale: this.getGuidance(model),
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
            timeout: 90000,
          }
        );

        if (response.status === 200) {
          const base64 = Buffer.from(response.data).toString('base64');
          const imageUrl = `data:image/png;base64,${base64}`;
          this.logger.log(`Image generated successfully with ${model} via ${baseUrl}`);
          return { imageUrl, model, provider: 'huggingface' };
        }
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`Endpoint ${baseUrl} failed for ${model}: ${error.message}`);
        continue;
      }
    }

    throw lastError || new Error(`Failed to generate image with ${model}`);
  }

  async generateVideo(params: {
    prompt: string;
    model?: string;
    duration?: number;
  }): Promise<{ videoUrl: string; model: string; provider: string }> {
    const { prompt, model = 'Wan-AI/Wan2.2-T2V-A14B' } = params;

    if (!this.apiKey) {
      throw new Error('HUGGINGFACE_API_KEY is not set.');
    }

    const endpoints = [
      'https://router.huggingface.co/hf-inference/models',
      'https://api-inference.huggingface.co/models',
    ];

    let lastError: any;
    for (const baseUrl of endpoints) {
      try {
        this.logger.log(`Trying video endpoint: ${baseUrl}/${model}`);
        const response = await axios.post(
          `${baseUrl}/${model}`,
          { inputs: prompt },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
            timeout: 180000,
          }
        );

        if (response.status === 200) {
          const base64 = Buffer.from(response.data).toString('base64');
          const videoUrl = `data:video/mp4;base64,${base64}`;
          this.logger.log(`Video generated successfully with ${model}`);
          return { videoUrl, model, provider: 'huggingface' };
        }
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`Video endpoint ${baseUrl} failed: ${error.message}`);
        continue;
      }
    }

    throw lastError || new Error(`Failed to generate video with ${model}`);
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

  private getSteps(model: string): number {
    if (model.includes('FLUX.1-schnell')) return 4;
    if (model.includes('Krea2')) return 4;
    if (model.includes('Qwen')) return 30;
    if (model.includes('Z-Image')) return 25;
    return 25;
  }

  private getGuidance(model: string): number {
    if (model.includes('FLUX')) return 0.0;
    if (model.includes('Krea2')) return 0.0;
    if (model.includes('Qwen')) return 7.0;
    return 7.5;
  }

  private enhancePrompt(prompt: string): string {
    const qualityModifiers = ['masterpiece', 'best quality', 'highly detailed', 'professional', 'sharp focus', '8k'];
    const hasQuality = qualityModifiers.some(m => prompt.toLowerCase().includes(m.toLowerCase()));
    if (hasQuality) return prompt;
    return `${prompt}, masterpiece, best quality, highly detailed, professional, sharp focus, cinematic lighting, vivid colors`;
  }
}
