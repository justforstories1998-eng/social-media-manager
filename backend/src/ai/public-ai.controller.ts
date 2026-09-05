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
    const model = 'black-forest-labs/flux.2-klein-4b';

    const results: any = {};

    // Test 1: Full payload with mode
    try {
      const res = await axios.post(`https://ai.api.nvidia.com/v1/genai/${model}`, {
        prompt: 'a red circle',
        height: 1024,
        width: 1024,
        cfg_scale: 0,
        samples: 1,
        seed: 0,
        steps: 8,
        image: null,
        mode: 'Image Generation',
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 90000,
      });
      results.test1_full_payload = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts, artifactCount: res.data?.artifacts?.length };
    } catch (e: any) {
      results.test1_full_payload = { status: e.response?.status, data: JSON.stringify(e.response?.data || e.message).substring(0, 500) };
    }

    // Test 2: Schnell with full payload
    try {
      const res = await axios.post(`https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell`, {
        prompt: 'a red circle',
        height: 1024,
        width: 1024,
        cfg_scale: 0,
        samples: 1,
        seed: 42,
        steps: 4,
        image: null,
        mode: 'base',
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 90000,
      });
      results.test2_schnell = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts };
    } catch (e: any) {
      results.test2_schnell = { status: e.response?.status, data: JSON.stringify(e.response?.data || e.message).substring(0, 500) };
    }

    return results;
  }
}
