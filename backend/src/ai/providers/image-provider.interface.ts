export interface ImageProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  generate(params: {
    prompt: string;
    model?: string;
    width?: number;
    height?: number;
    seed?: number;
  }): Promise<{ imageUrl: string; model: string; provider: string }>;
  getModels(): Array<{ id: string; name: string; description: string }>;
}
