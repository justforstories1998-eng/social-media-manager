import { ImageProvider } from './image-provider.interface';

export class ProviderRegistry {
  private imageProviders: ImageProvider[] = [];

  registerImageProvider(provider: ImageProvider) {
    this.imageProviders.push(provider);
  }

  async getImageProvider(preferred?: string): Promise<ImageProvider> {
    if (preferred) {
      const found = this.imageProviders.find(p => p.name === preferred);
      if (found && await found.isAvailable()) return found;
    }
    for (const p of this.imageProviders) {
      if (await p.isAvailable()) return p;
    }
    throw new Error('No image provider available. Configure NVIDIA_API_KEY, NVIDIA_MODEL, and NVIDIA_API_BASE_URL.');
  }

  getAllImageProviders(): ImageProvider[] {
    return this.imageProviders;
  }
}
