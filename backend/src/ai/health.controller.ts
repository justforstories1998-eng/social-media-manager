import { Controller, Get } from '@nestjs/common';
import axios from 'axios';

@Controller('health')
export class HealthController {
  @Get('image-api')
  async testImageApi() {
    const results: any = {};
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Test actual model inference on router.huggingface.co
    if (apiKey) {
      try {
        const start = Date.now();
        const res = await axios.post(
          'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
          { inputs: 'a blue circle on white background' },
          {
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            timeout: 60000,
          }
        );
        results.routerModel = { status: 'success', ms: Date.now() - start, responseSize: res.data?.length || 0 };
      } catch (e: any) {
        results.routerModel = { status: 'failed', error: e.response?.data?.error || e.message, code: e.response?.status };
      }
    }

    results.hasHFApiKey = !!apiKey;

    return results;
  }
}
