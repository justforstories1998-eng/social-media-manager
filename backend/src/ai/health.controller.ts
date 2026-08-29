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

    // Test different HuggingFace provider backends
    const endpoints = [
      { name: 'router-hf-inference', url: 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell' },
      { name: 'router-together', url: 'https://router.huggingface.co/together/models/black-forest-labs/FLUX.1-schnell' },
      { name: 'router-nebius', url: 'https://router.huggingface.co/nebius/models/black-forest-labs/FLUX.1-schnell' },
      { name: 'inference-api', url: 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell' },
      { name: 'together-direct', url: 'https://api.together.xyz/v1/images/generations' },
    ];

    for (const { name, url } of endpoints) {
      try {
        const start = Date.now();
        let res;
        if (name === 'together-direct') {
          res = await axios.post(url, {
            model: 'black-forest-labs/FLUX.1-schnell-Free',
            prompt: 'a blue circle on white background',
            n: 1,
          }, {
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            timeout: 30000,
          });
        } else {
          res = await axios.post(url, { inputs: 'a blue circle on white background' }, {
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            timeout: 30000,
          });
        }
        results[name] = { status: 'WORKING', ms: Date.now() - start };
      } catch (e: any) {
        results[name] = { status: 'failed', code: e.response?.status, error: String(e.response?.data?.error || e.message || 'unknown').substring(0, 100) };
      }
    }

    return results;
  }
}
