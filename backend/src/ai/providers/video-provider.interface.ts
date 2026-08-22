export interface VideoProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  generateVideo(params: {
    prompt: string;
    model?: string;
    duration?: number;
  }): Promise<{ videoUrl: string; model: string; provider: string }>;
  getModels(): Array<{ id: string; name: string; description: string }>;
}
