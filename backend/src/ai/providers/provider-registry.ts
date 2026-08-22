import { ImageProvider } from './image-provider.interface';
import { VideoProvider } from './video-provider.interface';

export class ProviderRegistry {
  private imageProviders: ImageProvider[] = [];
  private videoProviders: VideoProvider[] = [];

  registerImageProvider(provider: ImageProvider) {
    this.imageProviders.push(provider);
  }

  registerVideoProvider(provider: VideoProvider) {
    this.videoProviders.push(provider);
  }

  async getImageProvider(preferred?: string): Promise<ImageProvider> {
    if (preferred) {
      const found = this.imageProviders.find(p => p.name === preferred);
      if (found && await found.isAvailable()) return found;
    }
    for (const p of this.imageProviders) {
      if (await p.isAvailable()) return p;
    }
    throw new Error('No image provider available');
  }

  async getVideoProvider(preferred?: string): Promise<VideoProvider> {
    if (preferred) {
      const found = this.videoProviders.find(p => p.name === preferred);
      if (found && await found.isAvailable()) return found;
    }
    for (const p of this.videoProviders) {
      if (await p.isAvailable()) return p;
    }
    throw new Error('No video provider available');
  }

  getAllImageProviders(): ImageProvider[] {
    return this.imageProviders;
  }

  getAllVideoProviders(): VideoProvider[] {
    return this.videoProviders;
  }
}
