import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageProvider, GeneratedImageResult } from './image-provider.interface';
import axios from 'axios';

const NVIDIA_MODELS = [
  { id: 'black-forest-labs/flux.1-schnell', name: 'FLUX.1 Schnell', description: 'Fast (4 steps), 1024x1024 only', capabilities: ['text-to-image'], steps: 4, cfgScale: 0, maxSize: 1024 },
  { id: 'black-forest-labs/flux.1-dev', name: 'FLUX.1 Dev', description: 'Highest quality (20 steps)', capabilities: ['text-to-image', 'image-to-image'], steps: 20, cfgScale: 3.5, maxSize: 1440 },
  { id: 'black-forest-labs/flux.2-klein-4b', name: 'FLUX.2 Klein 4B', description: 'Efficient (8 steps)', capabilities: ['text-to-image'], steps: 8, cfgScale: 3.5, maxSize: 1440 },
];

@Injectable()
export class NvidiaProvider implements ImageProvider {
  name = 'nvidia';
  private readonly logger = new Logger(NvidiaProvider.name);
  private apiKey: string;
  private defaultModel: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('NVIDIA_API_KEY') || '';
    this.defaultModel = this.configService.get('NVIDIA_MODEL') || 'black-forest-labs/flux.1-schnell';
    this.baseUrl = this.configService.get('NVIDIA_API_BASE_URL') || 'https://ai.api.nvidia.com/v1';
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn('NVIDIA_API_KEY not configured');
      return false;
    }
    return true;
  }

  private resolveModel(model?: string): string {
    if (model && NVIDIA_MODELS.some(m => m.id === model)) return model;
    return this.defaultModel;
  }

  private getModelConfig(modelId: string) {
    return NVIDIA_MODELS.find(m => m.id === modelId) || NVIDIA_MODELS[0];
  }

  private buildProductPreservationPrompt(userPrompt: string): string {
    return `Create a professional commercial advertisement using the supplied product image as the authoritative visual reference.

Preserve the product's identity, shape, proportions, colours, materials, distinctive design elements and important details.

Do not replace the product with another product.
Do not redesign the product.
Do not alter its fundamental shape.

Creative direction:

${userPrompt}

Create a premium commercial advertising composition with professional lighting, realistic materials, cinematic colour grading and strong visual hierarchy.

Do not generate watermarks, random text, fake branding, or unrelated objects.`;
  }

  private async callNvidiaWithRetry(modelId: string, data: any, retries = 2): Promise<any> {
    // Try OpenAI-compatible endpoint first (more reliable on hosted API)
    const openaiUrl = `${this.baseUrl}/images/generations`;
    const nimUrl = `${this.baseUrl}/genai/${modelId}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      // Try OpenAI-compatible endpoint
      try {
        this.logger.log(`Attempt ${attempt + 1}: POST ${openaiUrl}`);
        const openaiData = {
          model: modelId,
          prompt: data.prompt,
          n: 1,
          response_format: 'b64_json',
          size: '1024x1024',
          seed: data.seed || 0,
          steps: data.steps,
        };
        const response = await axios.post(openaiUrl, openaiData, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 180000,
        });
        this.logger.log(`OpenAI endpoint success: ${response.status}`);
        return response.data;
      } catch (openaiError: any) {
        this.logger.warn(`OpenAI endpoint failed (${openaiError.response?.status}): ${openaiError.message}`);
      }

      // Fallback to NIM endpoint
      try {
        this.logger.log(`Attempt ${attempt + 1}: POST ${nimUrl}`);
        const response = await axios.post(nimUrl, data, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 180000,
        });
        this.logger.log(`NIM endpoint success: ${response.status}`);
        return response.data;
      } catch (nimError: any) {
        const status = nimError.response?.status;
        const errData = nimError.response?.data;
        this.logger.error(`NIM endpoint ${status}: ${JSON.stringify(errData || nimError.message).substring(0, 500)}`);

        if (status === 401 || status === 403) {
          throw new Error('Invalid NVIDIA API key. Get a key at https://build.nvidia.com');
        }
        if (status === 422) {
          throw new Error(`Invalid parameters: ${errData?.detail || errData?.message || 'Check request body'}`);
        }
        if (status === 429) {
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
            continue;
          }
          throw new Error('Rate limited. Try again in a few seconds.');
        }
        if (status === 503) {
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 5000));
            continue;
          }
          throw new Error('Model is loading. Try again in 30 seconds.');
        }
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        throw new Error(`NVIDIA API error: ${errData?.error || nimError.message}`);
      }
    }
  }

  private normalizeResponse(raw: any, model: string, defaultWidth: number, defaultHeight: number): GeneratedImageResult {
    const images: GeneratedImageResult['images'] = [];

    // NIM format: { artifacts: [{ base64: "..." }] }
    if (raw.artifacts && Array.isArray(raw.artifacts)) {
      for (const artifact of raw.artifacts) {
        if (artifact.base64) {
          const b64 = artifact.base64.startsWith('data:') ? artifact.base64 : `data:image/png;base64,${artifact.base64}`;
          images.push({ imageUrl: b64, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        }
      }
    }

    // OpenAI format: { data: [{ b64_json: "..." }] }
    if (images.length === 0 && raw.data && Array.isArray(raw.data)) {
      for (const item of raw.data) {
        if (item.b64_json) {
          images.push({ imageUrl: `data:image/png;base64,${item.b64_json}`, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        } else if (item.url) {
          images.push({ imageUrl: item.url, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        }
      }
    }

    // Alternative: { images: [{ b64_json: "..." }] }
    if (images.length === 0 && raw.images && Array.isArray(raw.images)) {
      for (const img of raw.images) {
        if (img.b64_json) images.push({ imageUrl: `data:image/png;base64,${img.b64_json}`, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        else if (img.url) images.push({ imageUrl: img.url, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
      }
    }

    if (images.length === 0) {
      this.logger.error('No images in response:', JSON.stringify(raw).substring(0, 500));
      throw new Error('No images returned. Response: ' + JSON.stringify(raw).substring(0, 200));
    }

    return { success: true, model, provider: 'nvidia', images };
  }

  async generateTextToImage(params: {
    prompt: string;
    width?: number;
    height?: number;
    numberOfImages?: number;
    seed?: number;
  }): Promise<GeneratedImageResult> {
    const model = this.resolveModel();
    const config = this.getModelConfig(model);
    const width = Math.min(params.width || 1024, config.maxSize);
    const height = Math.min(params.height || 1024, config.maxSize);

    const data: any = {
      prompt: params.prompt,
      height,
      width,
      cfg_scale: config.cfgScale,
      mode: 'base',
      samples: 1,
      seed: params.seed || 0,
      steps: config.steps,
      image: null,
    };

    const raw = await this.callNvidiaWithRetry(model, data);
    return this.normalizeResponse(raw, model, width, height);
  }

  async generateWithProduct(params: {
    prompt: string;
    productImage: string;
    width?: number;
    height?: number;
    numberOfImages?: number;
    seed?: number;
  }): Promise<GeneratedImageResult> {
    const model = this.resolveModel();
    const config = this.getModelConfig(model);
    const width = Math.min(params.width || 1024, config.maxSize);
    const height = Math.min(params.height || 1024, config.maxSize);
    const enhancedPrompt = this.buildProductPreservationPrompt(params.prompt);

    const data: any = {
      prompt: enhancedPrompt,
      height,
      width,
      cfg_scale: config.cfgScale,
      mode: 'base',
      samples: 1,
      seed: params.seed || 0,
      steps: config.steps,
      image: null,
    };

    if (params.productImage && config.capabilities.includes('image-to-image')) {
      data.image = params.productImage.startsWith('http') || params.productImage.startsWith('data:')
        ? params.productImage
        : `data:image/png;base64,${params.productImage}`;
    }

    const raw = await this.callNvidiaWithRetry(model, data);
    return this.normalizeResponse(raw, model, width, height);
  }

  async generateWithBackgroundRemoval(params: {
    prompt: string;
    productImage: string;
    width?: number;
    height?: number;
    numberOfImages?: number;
    seed?: number;
  }): Promise<GeneratedImageResult> {
    const model = this.resolveModel();
    const config = this.getModelConfig(model);
    const width = Math.min(params.width || 1024, config.maxSize);
    const height = Math.min(params.height || 1024, config.maxSize);

    const bgPrompt = `Create a professional advertising background for a product. ${params.prompt}

Create only the background scene, environment, lighting, atmosphere, and visual effects. Do not include any product.`;

    const data: any = {
      prompt: bgPrompt,
      height,
      width,
      cfg_scale: config.cfgScale,
      mode: 'base',
      samples: 1,
      seed: params.seed || 0,
      steps: config.steps,
      image: null,
    };

    const raw = await this.callNvidiaWithRetry(model, data);
    return this.normalizeResponse(raw, model, width, height);
  }

  getModels(): Array<{ id: string; name: string; description: string; capabilities: string[] }> {
    return NVIDIA_MODELS;
  }

  getSupportedAspectRatios(): string[] {
    return ['1:1'];
  }

  getResolutionForAspectRatio(ratio: string): { width: number; height: number } {
    return { width: 1024, height: 1024 };
  }
}
