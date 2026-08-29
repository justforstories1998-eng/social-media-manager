import { Controller, Get } from '@nestjs/common';
import axios from 'axios';

@Controller('health')
export class HealthController {
  @Get('image-api')
  async testImageApi() {
    const results: any = {};

    const urls = [
      { name: 'huggingface.co', url: 'https://huggingface.co' },
      { name: 'router.huggingface.co', url: 'https://router.huggingface.co' },
      { name: 'api-inference.huggingface.co', url: 'https://api-inference.huggingface.co' },
    ];

    for (const { name, url } of urls) {
      try {
        const start = Date.now();
        await axios.get(url, { timeout: 10000 });
        results[name] = { status: 'reachable', ms: Date.now() - start };
      } catch (e: any) {
        results[name] = { status: 'failed', error: e.message };
      }
    }

    results.hasHFApiKey = !!(process.env.HUGGINGFACE_API_KEY);
    results.hfKeyPrefix = process.env.HUGGINGFACE_API_KEY?.substring(0, 6) || 'none';

    return results;
  }
}
