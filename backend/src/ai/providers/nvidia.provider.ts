import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageProvider, GeneratedImageResult } from './image-provider.interface';
import axios from 'axios';

const NVIDIA_MODELS = [
  { id: 'black-forest-labs/flux.1-schnell', name: 'FLUX.1 Schnell', description: 'Fast generation, good quality', capabilities: ['text-to-image', 'image-to-image'] },
  { id: 'black-forest-labs/flux.1-dev', name: 'FLUX.1 Dev', description: 'Highest quality, slower', capabilities: ['text-to-image', 'image-to-image'] },
  { id: 'black-forest-labs/flux.2-klein-4b', name: 'FLUX.2 Klein 4B', description: 'Efficient, newer model', capabilities: ['text-to-image', 'image-to-image'] },
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
    this.baseUrl = this.configService.get('NVIDIA_API_BASE_URL') || 'https://integrate.api.nvidia.com/v1';
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
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

  private async callNvidiaApi(endpoint: string, data: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    this.logger.log(`Calling NVIDIA API: ${url}`);

    const response = await axios.post(url, data, {
      headers: this.getHeaders(),
      timeout: 120000,
    });

    return response.data;
  }

  private normalizeResponse(raw: any, model: string, defaultWidth: number, defaultHeight: number): GeneratedImageResult {
    const images: GeneratedImageResult['images'] = [];

    if (raw.images && Array.isArray(raw.images)) {
      for (const img of raw.images) {
        if (img.b64_json) {
          images.push({
            imageUrl: `data:image/png;base64,${img.b64_json}`,
            mimeType: 'image/png',
            width: img.width || defaultWidth,
            height: img.height || defaultHeight,
          });
        } else if (img.url) {
          images.push({
            imageUrl: img.url,
            mimeType: 'image/png',
            width: img.width || defaultWidth,
            height: img.height || defaultHeight,
          });
        }
      }
    } else if (raw.output && Array.isArray(raw.output)) {
      for (const item of raw.output) {
        if (item.b64_json) {
          images.push({
            imageUrl: `data:image/png;base64,${item.b64_json}`,
            mimeType: 'image/png',
            width: item.width || defaultWidth,
            height: item.height || defaultHeight,
          });
        } else if (item.url) {
          images.push({
            imageUrl: item.url,
            mimeType: 'image/png',
            width: item.width || defaultWidth,
            height: item.height || defaultHeight,
          });
        }
      }
    } else if (raw.data) {
      if (Array.isArray(raw.data)) {
        for (const item of raw.data) {
          if (item.b64_json) {
            images.push({
              imageUrl: `data:image/png;base64,${item.b64_json}`,
              mimeType: 'image/png',
              width: defaultWidth,
              height: defaultHeight,
            });
          } else if (item.url) {
            images.push({
              imageUrl: item.url,
              mimeType: 'image/png',
              width: defaultWidth,
              height: defaultHeight,
            });
          }
        }
      } else if (raw.data.b64_json) {
        images.push({
          imageUrl: `data:image/png;base64,${raw.data.b64_json}`,
          mimeType: 'image/png',
          width: defaultWidth,
          height: defaultHeight,
        });
      }
    } else if (raw.image) {
      if (typeof raw.image === 'string') {
        images.push({
          imageUrl: raw.image.startsWith('data:') ? raw.image : `data:image/png;base64,${raw.image}`,
          mimeType: 'image/png',
          width: defaultWidth,
          height: defaultHeight,
        });
      }
    }

    if (images.length === 0) {
      this.logger.error('NVIDIA response contained no images:', JSON.stringify(raw).substring(0, 500));
      throw new Error('No images returned from NVIDIA API');
    }

    return {
      success: true,
      model,
      provider: 'nvidia',
      images,
    };
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
      width,
      height,
    };

    if (params.seed !== undefined) data.seed = params.seed;
    if (params.numberOfImages) data.num_images = params.numberOfImages;

    const raw = await this.callNvidiaApi('/genai/' + encodeURIComponent(model), data);
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
      width,
      height,
    };

    if (params.productImage) {
      if (params.productImage.startsWith('http')) {
        data.image_url = params.productImage;
      } else if (params.productImage.startsWith('data:')) {
        const base64 = params.productImage.split(',')[1];
        data.image = base64;
      } else {
        data.image = params.productImage;
      }
    }

    if (params.seed !== undefined) data.seed = params.seed;
    if (params.numberOfImages) data.num_images = params.numberOfImages;

    const raw = await this.callNvidiaApi('/genai/' + encodeURIComponent(model), data);
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

    this.logger.log('Background removal workflow: generating background with NVIDIA');

    const bgPrompt = `Create a professional advertising background and environment for a product. ${params.prompt}

Create only the background scene, environment, lighting, atmosphere, and visual effects. Do not include any product. The background should be suitable for compositing a product onto later.

Use professional advertising photography style, realistic lighting, cinematic colour grading.`;

    const data: any = {
      prompt: bgPrompt,
      width,
      height,
    };

    if (params.seed !== undefined) data.seed = params.seed;

    const raw = await this.callNvidiaApi('/genai/' + encodeURIComponent(model), data);
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
