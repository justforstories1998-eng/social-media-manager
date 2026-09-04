import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageProvider, GeneratedImageResult } from './image-provider.interface';
import axios from 'axios';

@Injectable()
export class NvidiaProvider implements ImageProvider {
  name = 'nvidia';
  private readonly logger = new Logger(NvidiaProvider.name);
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('NVIDIA_API_KEY') || '';
    this.model = this.configService.get('NVIDIA_MODEL') || '';
    this.baseUrl = this.configService.get('NVIDIA_API_BASE_URL') || '';
  }

  async isAvailable(): Promise<boolean> {
    return !!(this.apiKey && this.model && this.baseUrl);
  }

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
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

  async generateTextToImage(params: {
    prompt: string;
    width?: number;
    height?: number;
    numberOfImages?: number;
    seed?: number;
  }): Promise<GeneratedImageResult> {
    // TODO: Implement when NVIDIA model details are provided
    // Expected API call structure:
    //
    // const response = await axios.post(
    //   `${this.baseUrl}/path-to-endpoint`,
    //   {
    //     model: this.model,
    //     prompt: params.prompt,
    //     width: params.width || 1024,
    //     height: params.height || 1024,
    //     seed: params.seed,
    //     // ... other model-specific parameters
    //   },
    //   { headers: this.getAuthHeaders() }
    // );
    //
    // return {
    //   success: true,
    //   model: this.model,
    //   provider: 'nvidia',
    //   images: [{ imageUrl: '...', mimeType: 'image/png', width: ..., height: ... }]
    // };

    throw new Error('NVIDIA provider not yet configured. Provide NVIDIA_API_KEY, NVIDIA_MODEL, and NVIDIA_API_BASE_URL.');
  }

  async generateWithProduct(params: {
    prompt: string;
    productImage: string;
    width?: number;
    height?: number;
    numberOfImages?: number;
    seed?: number;
  }): Promise<GeneratedImageResult> {
    const enhancedPrompt = this.buildProductPreservationPrompt(params.prompt);

    // TODO: Implement when NVIDIA model details are provided
    // If model supports image input/reference:
    //
    // const response = await axios.post(
    //   `${this.baseUrl}/path-to-endpoint`,
    //   {
    //     model: this.model,
    //     prompt: enhancedPrompt,
    //     image: params.productImage, // or image_url, reference_image, etc.
    //     width: params.width || 1024,
    //     height: params.height || 1024,
    //     seed: params.seed,
    //   },
    //   { headers: this.getAuthHeaders() }
    // );
    //
    // return normalized result;

    throw new Error('NVIDIA provider not yet configured. Provide NVIDIA model details.');
  }

  async generateWithBackgroundRemoval(params: {
    prompt: string;
    productImage: string;
    width?: number;
    height?: number;
    numberOfImages?: number;
    seed?: number;
  }): Promise<GeneratedImageResult> {
    // TODO: Implement when NVIDIA model details are provided
    // Workflow:
    // 1. Remove background from product image
    // 2. Generate AI background with NVIDIA
    // 3. Composite original product onto generated background
    // 4. Return final advertisement

    throw new Error('NVIDIA provider not yet configured. Provide NVIDIA model details.');
  }

  getModels(): Array<{ id: string; name: string; description: string; capabilities: string[] }> {
    // TODO: Return actual model info when NVIDIA details are provided
    return [
      {
        id: this.model || 'pending',
        name: 'NVIDIA Model',
        description: 'NVIDIA AI image generation (configure NVIDIA_MODEL env var)',
        capabilities: ['text-to-image', 'image-to-image'],
      },
    ];
  }

  getSupportedAspectRatios(): string[] {
    // TODO: Return actual supported ratios when NVIDIA details are provided
    return ['1:1', '4:5', '9:16', '16:9', '4:3'];
  }
}
