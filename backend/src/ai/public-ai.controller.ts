import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('ai')
export class PublicAIController {
  constructor(private configService: ConfigService) {}

  @Get('diagnose')
  diagnose() {
    const nvidiaKey = this.configService.get('NVIDIA_API_KEY') || '';
    return {
      nvidia_key_set: !!nvidiaKey,
      nvidia_key_prefix: nvidiaKey ? nvidiaKey.substring(0, 12) + '...' : 'NOT SET',
      nvidia_key_length: nvidiaKey.length,
      nvidia_model: this.configService.get('NVIDIA_MODEL') || 'black-forest-labs/flux.2-klein-4b',
      nvidia_url: this.configService.get('NVIDIA_API_BASE_URL') || 'https://integrate.api.nvidia.com/v1',
      openrouter_key_set: !!this.configService.get('OPENROUTER_API_KEY'),
    };
  }

  @Post('test-nvidia')
  async testNvidia(@Body() body: { endpoint?: string }) {
    const apiKey = this.configService.get('NVIDIA_API_KEY') || '';
    const baseUrl = body.endpoint || this.configService.get('NVIDIA_API_BASE_URL') || 'https://integrate.api.nvidia.com/v1';
    const model = 'black-forest-labs/flux.2-klein-4b';

    const results: any = {};

    // Test 1: NIM endpoint (correct format with vendor prefix)
    try {
      const nimUrl = `https://ai.api.nvidia.com/v1/genai/${model}`;
      const res = await axios.post(nimUrl, {
        prompt: 'a simple red circle on white background',
        seed: 0,
        width: 1024,
        height: 1024,
        steps: 8,
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000,
      });
      results.nim = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts };
    } catch (e: any) {
      results.nim = { status: e.response?.status, data: e.response?.data || e.message };
    }

    // Test 2: Models endpoint (different base URL)
    try {
      const res = await axios.get('https://integrate.api.nvidia.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        timeout: 10000,
      });
      results.models = { status: res.status, count: res.data?.data?.length || 0 };
    } catch (e: any) {
      results.models = { status: e.response?.status, data: e.response?.data || e.message };
    }

    return results;
  }
}
