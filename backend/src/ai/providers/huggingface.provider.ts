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
    { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL', description: 'Photorealistic, strong composition' },
    { id: 'stabilityai/stable-diffusion-3-medium', name: 'SD3 Medium', description: 'Stable Diffusion 3 — latest architecture' },
  ];

  private videoModels = [
    { id: 'Wan-AI/Wan2.2-T2V-A14B', name: 'Wan 2.2 Text-to-Video', description: 'Best free text-to-video generation' },
    { id: 'Wan-AI/Wan2.2-TI2V-5B', name: 'Wan 2.2 Text+Image-to-Video', description: 'Text + image to video' },
    { id: 'Wan-AI/Wan2.2-I2V-A14B', name: 'Wan 2.2 Image-to-Video', description: 'Image to video generation' },
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
        `https://router.huggingface.co/hf-inference/models/${model}`,
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

      const base64 = Buffer.from(response.data).toString('base64');
      const imageUrl = `data:image/png;base64,${base64}`;

      return { imageUrl, model, provider: 'huggingface' };
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      this.logger.error(`HuggingFace image generation failed (${model}): ${msg}`);

      // If model is loading (cold start), wait and retry
      if (error.response?.status === 503) {
        this.logger.warn(`Model ${model} is loading, waiting 30s and retrying...`);
        await new Promise(r => setTimeout(r, 30000));
        const retryRes = await axios.post(
          `https://router.huggingface.co/hf-inference/models/${model}`,
          { inputs: enhancedPrompt, parameters: { width, height } },
          {
            headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
            responseType: 'arraybuffer',
            timeout: 180000,
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
    const { prompt, model = 'Wan-AI/Wan2.2-T2V-A14B' } = params;

    if (!this.apiKey) {
      throw new Error('HuggingFace API key not configured. Set HUGGINGFACE_API_KEY environment variable.');
    }

    try {
      const response = await axios.post(
        `https://router.huggingface.co/hf-inference/models/${model}`,
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

      const base64 = Buffer.from(response.data).toString('base64');
      const videoUrl = `data:video/mp4;base64,${base64}`;

      return { videoUrl, model, provider: 'huggingface' };
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      this.logger.error(`HuggingFace video generation failed (${model}): ${msg}`);

      // If model is loading, wait and retry
      if (error.response?.status === 503) {
        this.logger.warn(`Video model ${model} is loading, waiting 60s and retrying...`);
        await new Promise(r => setTimeout(r, 60000));
        const retryRes = await axios.post(
          `https://router.huggingface.co/hf-inference/models/${model}`,
          { inputs: prompt },
          {
            headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
            responseType: 'arraybuffer',
            timeout: 300000,
          }
        );
        const base64 = Buffer.from(retryRes.data).toString('base64');
        return { videoUrl: `data:video/mp4;base64,${base64}`, model, provider: 'huggingface' };
      }

      throw error;
    }
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
    if (model.includes('FLUX.2')) return 8;
    if (model.includes('Qwen')) return 30;
    return 25;
  }

  private getGuidance(model: string): number {
    if (model.includes('FLUX')) return 0.0;
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
