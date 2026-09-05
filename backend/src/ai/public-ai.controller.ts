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

    // Test 1: NIM endpoint
    try {
      const nimUrl = `${baseUrl}/genai/${model}`;
      const res = await axios.post(nimUrl, {
        prompt: 'a simple red circle on white background',
        height: 1024,
        width: 1024,
        cfg_scale: 0,
        mode: 'base',
        samples: 1,
        seed: 0,
        steps: 4,
        image: null,
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000,
      });
      results.nim = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts };
    } catch (e: any) {
      results.nim = { status: e.response?.status, data: e.response?.data || e.message };
    }

    // Test 2: OpenAI-compatible endpoint
    try {
      const openaiUrl = `${baseUrl}/images/generations`;
      const res = await axios.post(openaiUrl, {
        model,
        prompt: 'a simple red circle on white background',
        n: 1,
        response_format: 'b64_json',
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000,
      });
      results.openai = { status: res.status, keys: Object.keys(res.data || {}), hasData: !!res.data?.data };
    } catch (e: any) {
      results.openai = { status: e.response?.status, data: e.response?.data || e.message };
    }

    // Test 3: Check key validity
    try {
      const res = await axios.get(`${baseUrl}/models`, {
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
