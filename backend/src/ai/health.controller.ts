import { Controller, Get } from '@nestjs/common';
import axios from 'axios';

@Controller('health')
export class HealthController {
  @Get('image-api')
  async testImageApi() {
    const results: any = {};

    // Test Pollinations.ai — no API key needed
    try {
      const start = Date.now();
      const res = await axios.get('https://image.pollinations.ai/prompt/a%20blue%20circle%20on%20white%20background?model=flux&width=256&height=256&nologo=true', {
        timeout: 30000,
        responseType: 'arraybuffer',
      });
      results.pollinations = { status: 'WORKING', ms: Date.now() - start, imageSize: res.data?.length || 0 };
    } catch (e: any) {
      results.pollinations = { status: 'failed', error: String(e.message || 'unknown').substring(0, 100) };
    }

    results.note = 'No API key required — completely free';
    return results;
  }
}
