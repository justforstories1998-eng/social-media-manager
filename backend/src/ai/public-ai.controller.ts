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
    const apiKey = this.configService.get('NVIDIA_API_KEY') || '';

    const results: any = {};

    // Test 1: Minimal payload (prompt only)
    try {
      const res = await axios.post(`https://ai.api.nvidia.com/v1/genai/${model}`, {
        prompt: 'a red circle',
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000,
      });
      results.test1_minimal = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts, artifactCount: res.data?.artifacts?.length };
    } catch (e: any) {
      results.test1_minimal = { status: e.response?.status, data: JSON.stringify(e.response?.data || e.message).substring(0, 300) };
    }

    // Test 2: With steps
    try {
      const res = await axios.post(`https://ai.api.nvidia.com/v1/genai/${model}`, {
        prompt: 'a red circle',
        steps: 8,
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000,
      });
      results.test2_steps = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts };
    } catch (e: any) {
      results.test2_steps = { status: e.response?.status, data: JSON.stringify(e.response?.data || e.message).substring(0, 300) };
    }

    // Test 3: With width/height/seed
    try {
      const res = await axios.post(`https://ai.api.nvidia.com/v1/genai/${model}`, {
        prompt: 'a red circle',
        width: 1024,
        height: 1024,
        seed: 42,
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000,
      });
      results.test3_full = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts };
    } catch (e: any) {
      results.test3_full = { status: e.response?.status, data: JSON.stringify(e.response?.data || e.message).substring(0, 300) };
    }

    // Test 4: Schnell model
    try {
      const res = await axios.post(`https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell`, {
        prompt: 'a red circle',
        width: 1024,
        height: 1024,
        seed: 42,
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000,
      });
      results.test4_schnell = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts };
    } catch (e: any) {
      results.test4_schnell = { status: e.response?.status, data: JSON.stringify(e.response?.data || e.message).substring(0, 300) };
    }

    return results;
  }
}
