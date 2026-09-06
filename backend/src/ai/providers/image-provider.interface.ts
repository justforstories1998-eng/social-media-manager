export interface ImageProvider {
  name: string;
  isAvailable(): Promise<boolean>;

  generateTextToImage(params: {
    prompt: string;
    width?: number;
    height?: number;
    numberOfImages?: number;
    seed?: number;
    model?: string;
  }): Promise<GeneratedImageResult>;

  generateWithProduct(params: {
    prompt: string;
    productImage: string;
    width?: number;
    height?: number;
    numberOfImages?: number;
    seed?: number;
    model?: string;
  }): Promise<GeneratedImageResult>;

  generateWithBackgroundRemoval(params: {
    prompt: string;
    productImage: string;
    width?: number;
    height?: number;
    numberOfImages?: number;
    seed?: number;
  }): Promise<GeneratedImageResult>;

  getModels(): Array<{ id: string; name: string; description: string; capabilities: string[] }>;
  getSupportedAspectRatios(): string[];
}

export interface GeneratedImageResult {
  success: boolean;
  model: string;
  provider: string;
  images: Array<{
    imageUrl: string;
    mimeType: string;
    width: number;
    height: number;
  }>;
}
