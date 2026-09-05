import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageProvider, GeneratedImageResult } from './image-provider.interface';
import axios from 'axios';

const NVIDIA_MODELS = [
  { id: 'flux.2-klein-4b', name: 'FLUX.2 Klein 4B', description: 'Efficient (8 steps)', capabilities: ['text-to-image'], steps: 8, cfgScale: 0, maxSize: 1024 },
  { id: 'flux.1-schnell', name: 'FLUX.1 Schnell', description: 'Fast (4 steps)', capabilities: ['text-to-image'], steps: 4, cfgScale: 0, maxSize: 1024 },
  { id: 'flux.1-dev', name: 'FLUX.1 Dev', description: 'Highest quality (20 steps)', capabilities: ['text-to-image', 'image-to-image'], steps: 20, cfgScale: 3.5, maxSize: 1440 },
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
    this.defaultModel = this.configService.get('NVIDIA_MODEL') || 'flux.2-klein-4b';
    this.baseUrl = this.configService.get('NVIDIA_API_BASE_URL') || 'https://integrate.api.nvidia.com/v1';
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn('NVIDIA_API_KEY not configured');
      return false;
    }
    return true;
  }

  private resolveModel(model?: string): string {
    if (model) {
      // Accept both short and long names
      const short = model.replace('black-forest-labs/', '');
      const found = NVIDIA_MODELS.find(m => m.id === short || m.id === model);
      if (found) return found.id;
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

Creative direction:

${userPrompt}

Create a premium commercial advertising composition with professional lighting, realistic materials, cinematic colour grading and strong visual hierarchy.

Do not generate watermarks, random text, fake branding, or unrelated objects.`;
  }

  private async callNvidiaApi(modelId: string, data: any): Promise<any> {
    const url = `${this.baseUrl}/images/generations`;
    this.logger.log(`Calling NVIDIA: ${url} model=${modelId}`);

    const payload = {
      model: modelId,
      prompt: data.prompt,
      n: 1,
      response_format: 'b64_json',
      seed: data.seed || 0,
      steps: data.steps,
    };

    this.logger.log(`Payload: ${JSON.stringify({ ...payload, prompt: payload.prompt.substring(0, 80) + '...' })}`);

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 180000,
      });
      this.logger.log(`NVIDIA success: ${response.status}`);
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const errData = error.response?.data;
      this.logger.error(`NVIDIA ${status}: ${JSON.stringify(errData || error.message).substring(0, 800)}`);

      if (status === 401 || status === 403) {
        throw new Error(`NVIDIA auth failed: ${errData?.detail || errData?.message || 'Check API key and model license at https://build.nvidia.com'}`);
      }
      if (status === 404) {
        throw new Error(`Model not found: ${modelId}. Available: ${NVIDIA_MODELS.map(m => m.id).join(', ')}`);
      }
      if (status === 422) {
        throw new Error(`Invalid parameters: ${errData?.detail || errData?.message || JSON.stringify(errData)}`);
      }
      if (status === 429) {
        throw new Error('Rate limited. Try again in a few seconds.');
      }
      if (status === 503) {
        throw new Error('Model is loading. Try again in 30 seconds.');
      }
      throw new Error(`NVIDIA API error: ${errData?.error || errData?.detail || error.message}`);
    }
  }

  private normalizeResponse(raw: any, model: string, defaultWidth: number, defaultHeight: number): GeneratedImageResult {
    const images: GeneratedImageResult['images'] = [];

    // OpenAI format: { data: [{ b64_json: "..." }] }
    if (raw.data && Array.isArray(raw.data)) {
      for (const item of raw.data) {
        if (item.b64_json) {
          images.push({ imageUrl: `data:image/png;base64,${item.b64_json}`, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        } else if (item.url) {
          images.push({ imageUrl: item.url, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        }
      }
    }

    // NIM format: { artifacts: [{ base64: "..." }] }
    if (images.length === 0 && raw.artifacts && Array.isArray(raw.artifacts)) {
      for (const artifact of raw.artifacts) {
        if (artifact.base64) {
          const b64 = artifact.base64.startsWith('data:') ? artifact.base64 : `data:image/png;base64,${artifact.base64}`;
          images.push({ imageUrl: b64, mimeType: 'image/png', width: defaultWidth, height: defaultHeight });
        }
      }
    }

    if (images.length === 0) {
      this.logger.error('No images in response:', JSON.stringify(raw).substring(0, 500));
      throw new Error('No images returned: ' + JSON.stringify(raw).substring(0, 200));
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

    const raw = await this.callNvidiaApi(model, {
      prompt: params.prompt,
      seed: params.seed || 0,
      steps: config.steps,
    });
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

    const raw = await this.callNvidiaApi(model, {
      prompt: enhancedPrompt,
      seed: params.seed || 0,
      steps: config.steps,
    });
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

    const raw = await this.callNvidiaApi(model, {
      prompt: bgPrompt,
      seed: params.seed || 0,
      steps: config.steps,
    });
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
