import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageProvider, GeneratedImageResult } from './image-provider.interface';
import axios from 'axios';

const NVIDIA_MODELS = [
  { id: 'black-forest-labs/flux.1-schnell', name: 'FLUX.1 Schnell', description: 'Fast generation, good quality', capabilities: ['text-to-image', 'image-to-image'], steps: 4 },
  { id: 'black-forest-labs/flux.1-dev', name: 'FLUX.1 Dev', description: 'Highest quality, slower', capabilities: ['text-to-image', 'image-to-image'], steps: 20 },
  { id: 'black-forest-labs/flux.2-klein-4b', name: 'FLUX.2 Klein 4B', description: 'Efficient, newer model', capabilities: ['text-to-image', 'image-to-image'], steps: 8 },
];

const ASPECT_RATIOS = {
  '1:1': { width: 1024, height: 1024 },
  '4:5': { width: 1024, height: 1280 },
  '9:16': { width: 768, height: 1344 },
  '16:9': { width: 1344, height: 768 },
  '4:3': { width: 1152, height: 896 },
  '3:4': { width: 896, height: 1152 },
};

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

  private getModelSteps(modelId: string): number {
    const found = NVIDIA_MODELS.find(m => m.id === modelId);
    return found?.steps || 4;
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
    this.logger.log(`Request body keys: ${Object.keys(data).join(', ')}`);

    try {
      const response = await axios.post(url, data, {
        headers: this.getHeaders(),
        timeout: 120000,
      });
      this.logger.log(`NVIDIA API response status: ${response.status}`);
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const errData = error.response?.data;
      this.logger.error(`NVIDIA API error: ${status} - ${JSON.stringify(errData || error.message).substring(0, 500)}`);

      if (status === 401 || status === 403) {
        throw new Error('Invalid NVIDIA API key. Check your NVIDIA_API_KEY on Render.');
      }
      if (status === 404) {
        throw new Error(`NVIDIA model not found: ${modelId}. Check your NVIDIA_MODEL setting.`);
      }
      if (status === 429) {
        throw new Error('NVIDIA API rate limit exceeded. Please try again later.');
      }
      if (errData?.error) {
        throw new Error(`NVIDIA API error: ${errData.error}`);
      }
      throw error;
    }
  }

  private normalizeResponse(raw: any, model: string, defaultWidth: number, defaultHeight: number): GeneratedImageResult {
    const images: GeneratedImageResult['images'] = [];

    // Handle NVIDIA NIM response format: { artifacts: [{ base64: "...", seed: ... }] }
    if (raw.artifacts && Array.isArray(raw.artifacts)) {
      for (const artifact of raw.artifacts) {
        if (artifact.base64) {
          const base64Data = artifact.base64.startsWith('data:') ? artifact.base64 : `data:image/png;base64,${artifact.base64}`;
          images.push({
            imageUrl: base64Data,
            mimeType: 'image/png',
            width: defaultWidth,
            height: defaultHeight,
          });
        }
      }
    }

    // Handle alternative response formats
    if (images.length === 0 && raw.images && Array.isArray(raw.images)) {
      for (const img of raw.images) {
        if (img.b64_json) {
          images.push({ imageUrl: `data:image/png;base64,${img.b64_json}`, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        } else if (img.url) {
          images.push({ imageUrl: img.url, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        }
      }
    }

    if (images.length === 0 && raw.data) {
      const items = Array.isArray(raw.data) ? raw.data : [raw.data];
      for (const item of items) {
        if (item.b64_json) {
          images.push({ imageUrl: `data:image/png;base64,${item.b64_json}`, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        } else if (item.url) {
          images.push({ imageUrl: item.url, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        }
      }
    }

    if (images.length === 0 && raw.output && Array.isArray(raw.output)) {
      for (const item of raw.output) {
        if (item.b64_json) {
          images.push({ imageUrl: `data:image/png;base64,${item.b64_json}`, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        } else if (item.url) {
          images.push({ imageUrl: item.url, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        }
      }
    }

    if (images.length === 0) {
      this.logger.error('NVIDIA response contained no images:', JSON.stringify(raw).substring(0, 500));
      throw new Error('No images returned from NVIDIA API. Response: ' + JSON.stringify(raw).substring(0, 200));
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
    const width = params.width || 1024;
    const height = params.height || 1024;

    const data: any = {
      prompt: params.prompt,
      negative_prompt: 'watermark, text, logo, branding, low quality, blurry, distorted, deformed',
      seed: params.seed || Math.floor(Math.random() * 4294967295),
      steps: this.getModelSteps(model),
      cfg_scale: 3.5,
      height,
      width,
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
    const width = params.width || 1024;
    const height = params.height || 1024;
    const enhancedPrompt = this.buildProductPreservationPrompt(params.prompt);

    const data: any = {
      prompt: enhancedPrompt,
      negative_prompt: 'watermark, text, logo, branding, low quality, blurry, distorted, deformed',
      seed: params.seed || Math.floor(Math.random() * 4294967295),
      steps: this.getModelSteps(model),
      cfg_scale: 3.5,
      height,
      width,
    };

    // Add product image reference
    if (params.productImage) {
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
    const width = params.width || 1024;
    const height = params.height || 1024;

    const bgPrompt = `Create a professional advertising background for a product. ${params.prompt}

Create only the background scene, environment, lighting, atmosphere, and visual effects. Do not include any product.`;

    const data: any = {
      prompt: bgPrompt,
      negative_prompt: 'watermark, text, logo, product, branding, low quality, blurry',
      seed: params.seed || Math.floor(Math.random() * 4294967295),
      steps: this.getModelSteps(model),
      cfg_scale: 3.5,
      height,
      width,
    };

    const raw = await this.callNvidiaApi(model, data);
    return this.normalizeResponse(raw, model, width, height);
  }

  getModels(): Array<{ id: string; name: string; description: string; capabilities: string[] }> {
    return NVIDIA_MODELS;
  }

  getSupportedAspectRatios(): string[] {
    return Object.keys(ASPECT_RATIOS);
  }

  getResolutionForAspectRatio(ratio: string): { width: number; height: number } {
    return ASPECT_RATIOS[ratio] || ASPECT_RATIOS['1:1'];
  }
}
