import { Controller, Get } from '@nestjs/common';
import axios from 'axios';

@Controller('health')
export class HealthController {
  @Get('image-api')
  async testImageApi() {
    const results: any = {};
    const apiKey = process.env.TOGETHER_API_KEY;

    if (!apiKey) {
      return { error: 'No TOGETHER_API_KEY set. Get one free at together.ai' };
    }

    // Test Together AI
    try {
      const start = Date.now();
      const res = await axios.post(
        'https://api.together.xyz/v1/images/generations',
        {
          model: 'black-forest-labs/FLUX.1-schnell-Free',
          prompt: 'a blue circle on white background',
          width: 512,
          height: 512,
          n: 1,
          response_format: 'b64_json',
        },
        {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 60000,
        }
      );
      const size = res.data?.data?.[0]?.b64_json?.length || 0;
      results.together = { status: 'WORKING', ms: Date.now() - start, imageSize: size };
    } catch (e: any) {
      results.together = { status: 'failed', code: e.response?.status, error: String(e.response?.data?.error?.message || e.message || 'unknown').substring(0, 150) };
    }

    results.hasApiKey = !!apiKey;
    results.keyPrefix = apiKey?.substring(0, 8) || 'none';

    return results;
  }
}
