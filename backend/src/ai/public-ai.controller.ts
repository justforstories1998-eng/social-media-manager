import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('ai')
export class PublicAIController {
  constructor(private configService: ConfigService) {}

  @Get('diagnose')
  diagnose() {
    const nvidiaKey = this.configService.get('NVIDIA_API_KEY') || '';
    return {
      nvidia_key_set: !!nvidiaKey,
      nvidia_key_prefix: nvidiaKey ? nvidiaKey.substring(0, 8) + '...' : 'NOT SET',
      nvidia_model: this.configService.get('NVIDIA_MODEL') || 'black-forest-labs/flux.1-schnell',
      nvidia_url: this.configService.get('NVIDIA_API_BASE_URL') || 'https://ai.api.nvidia.com/v1',
      openrouter_key_set: !!this.configService.get('OPENROUTER_API_KEY'),
    };
  }
}
