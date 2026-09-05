import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageProvider, GeneratedImageResult } from './image-provider.interface';
import axios from 'axios';

const NVIDIA_MODELS = [
  { id: 'black-forest-labs/flux.1-schnell', name: 'FLUX.1 Schnell', description: 'Fast, 4 steps, 1024x1024 only', capabilities: ['text-to-image'], steps: 4, cfgScale: 0, maxSize: 1024 },
  { id: 'black-forest-labs/flux.1-dev', name: 'FLUX.1 Dev', description: 'High quality, 20 steps', capabilities: ['text-to-image', 'image-to-image'], steps: 20, cfgScale: 3.5, maxSize: 1440 },
  { id: 'black-forest-labs/flux.2-klein-4b', name: 'FLUX.2 Klein 4B', description: 'Efficient, 8 steps', capabilities: ['text-to-image'], steps: 8, cfgScale: 3.5, maxSize: 1440 },
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

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private resolveModel(model?: string): string {
    if (model && NVIDIA_MODELS.some(m => m.id === model)) return model;
    if (model) {
      const match = NVIDIA_MODELS.find(m => m.id.includes(model) || m.name.toLowerCase().includes(model.toLowerCase()));
      if (match) return match.id;
    }
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
Do not create duplicate products.
Do not distort the product.

Creative direction:

${userPrompt}

Create a premium commercial advertising composition.

Use professional advertising photography, realistic lighting, realistic materials, realistic shadows, cinematic colour grading and strong visual hierarchy.

Make the supplied product the primary subject.

Create an environment and background that support the product and the user's creative direction.

Leave appropriate negative space for promotional text where requested.

Do not generate watermarks.
Do not generate random text.
Do not generate fake branding.
Do not generate unrelated products or objects.`;
  }

  private async callNvidiaApi(modelId: string, data: any): Promise<any> {
    const url = `${this.baseUrl}/genai/${modelId}`;
    this.logger.log(`Calling NVIDIA API: ${url}`);
    this.logger.log(`Request: ${JSON.stringify({ ...data, prompt: data.prompt?.substring(0, 80) + '...' })}`);

    try {
      const response = await axios.post(url, data, {
        headers: this.getHeaders(),
        timeout: 180000,
      });
      this.logger.log(`NVIDIA API response status: ${response.status}, keys: ${Object.keys(response.data || {}).join(', ')}`);
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const errData = error.response?.data;
      this.logger.error(`NVIDIA API ${status}: ${JSON.stringify(errData || error.message).substring(0, 800)}`);

      if (status === 401 || status === 403) {
        throw new Error('Invalid NVIDIA API key. Get a key at https://build.nvidia.com');
      }
      if (status === 404) {
        throw new Error(`Model not found: ${modelId}. Available: ${NVIDIA_MODELS.map(m => m.id).join(', ')}`);
      }
      if (status === 422) {
        const detail = errData?.detail || errData?.message || JSON.stringify(errData);
        throw new Error(`Invalid request parameters: ${detail}`);
      }
      if (status === 429) {
        throw new Error('NVIDIA API rate limit exceeded. Try again in a few seconds.');
      }
      if (status === 503) {
        throw new Error('NVIDIA API is loading the model. Please try again in 30 seconds.');
      }
      if (errData?.error) {
        throw new Error(`NVIDIA: ${errData.error}`);
      }
      throw error;
    }
  }

  private normalizeResponse(raw: any, model: string, defaultWidth: number, defaultHeight: number): GeneratedImageResult {
    const images: GeneratedImageResult['images'] = [];

    // NVIDIA NIM /v1/infer format: { artifacts: [{ base64: "...", seed: ... }] }
    if (raw.artifacts && Array.isArray(raw.artifacts)) {
      for (const artifact of raw.artifacts) {
        if (artifact.base64) {
          const base64Data = artifact.base64.startsWith('data:') ? artifact.base64 : `data:image/png;base64,${artifact.base64}`;
          images.push({ imageUrl: base64Data, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        }
      }
    }

    // OpenAI-compatible format: { data: [{ b64_json: "..." }] }
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
      this.logger.error('NVIDIA response had no images:', JSON.stringify(raw).substring(0, 500));
      throw new Error('No images in NVIDIA response: ' + JSON.stringify(raw).substring(0, 200));
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
    // Clamp to model's max size
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

    const raw = await this.callNvidiaApi(model, data);
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

    // Add product image reference if supported
    if (params.productImage && config.capabilities.includes('image-to-image')) {
      if (params.productImage.startsWith('http')) {
        data.image = params.productImage;
      } else if (params.productImage.startsWith('data:')) {
        data.image = params.productImage;
      } else {
        data.image = `data:image/png;base64,${params.productImage}`;
      }
    }

    const raw = await this.callNvidiaApi(model, data);
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

    const raw = await this.callNvidiaApi(model, data);
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
