import { Controller, Get } from '@nestjs/common';
import axios from 'axios';

@Controller('health')
export class HealthController {
  @Get('image-api')
  async testImageApi() {
    const results: any = {};
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      return { error: 'No HUGGINGFACE_API_KEY set' };
    }

    const modelsToTest = [
      'stabilityai/stable-diffusion-xl-base-1.0',
      'stabilityai/stable-diffusion-3-medium',
      'black-forest-labs/FLUX.1-dev',
      'runwayml/stable-diffusion-v1-5',
      'prompthero/openjourney-v4',
      'CompVis/stable-diffusion-v1-4',
    ];

    for (const model of modelsToTest) {
      try {
        const start = Date.now();
        const res = await axios.post(
          `https://router.huggingface.co/hf-inference/models/${model}`,
          { inputs: 'a blue circle on white background' },
          {
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            timeout: 30000,
          }
        );
        results[model] = { status: 'WORKING', ms: Date.now() - start, size: res.data?.length || 0 };
        break; // Found one that works, stop testing
      } catch (e: any) {
        results[model] = { status: 'failed', code: e.response?.status, error: e.response?.data?.error || e.message?.substring(0, 80) };
      }
    }

    return results;
  }
}
