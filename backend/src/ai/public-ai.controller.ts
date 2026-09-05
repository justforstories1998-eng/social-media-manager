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
      nvidia_url: 'https://ai.api.nvidia.com/v1/genai',
      openrouter_key_set: !!this.configService.get('OPENROUTER_API_KEY'),
    };
  }

  @Post('test-nvidia')
  async testNvidia() {
    const apiKey = this.configService.get('NVIDIA_API_KEY') || '';
    const model = 'black-forest-labs/flux.2-klein-4b';

    const results: any = {};

    try {
      const res = await axios.post(`https://ai.api.nvidia.com/v1/genai/${model}`, {
        prompt: 'a macro wildlife photo of a green frog in a rainforest pond',
        width: 1024,
        height: 1024,
        seed: 0,
        steps: 4,
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 120000,
      });
      results.klein = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts, artifactCount: res.data?.artifacts?.length };
    } catch (e: any) {
      results.klein = { status: e.response?.status, data: JSON.stringify(e.response?.data || e.message).substring(0, 500) };
    }

    return results;
  }

  @Post('trace-generate')
  async traceGenerate(@Body() body: { prompt?: string; model?: string; width?: number; height?: number; seed?: number }) {
    const apiKey = this.configService.get('NVIDIA_API_KEY') || '';
    const steps: any[] = [];
    const prompt = body.prompt || 'a beautiful sunset over mountains';
    const model = body.model || 'black-forest-labs/flux.2-klein-4b';
    const width = body.width || 1024;
    const height = body.height || 1024;
    const seed = body.seed || 0;

    steps.push({ step: 1, name: 'env', nvidia_key: !!apiKey, model, width, height, seed });

    const payload = { prompt, width, height, seed, steps: 4 };
    steps.push({ step: 2, name: 'payload', payload });

    try {
      const res = await axios.post(
        `https://ai.api.nvidia.com/v1/genai/${model}`,
        payload,
        {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 120000,
        }
      );
      steps.push({
        step: 3, name: 'nvidia_call', status: res.status,
        keys: Object.keys(res.data || {}),
        hasArtifacts: !!res.data?.artifacts,
        artifactCount: res.data?.artifacts?.length,
        firstArtifactKeys: res.data?.artifacts?.[0] ? Object.keys(res.data.artifacts[0]) : [],
      });
    } catch (e: any) {
      steps.push({
        step: 3, name: 'nvidia_call_failed',
        status: e.response?.status,
        data: JSON.stringify(e.response?.data || e.message).substring(0, 500),
      });
    }

    return { steps };
  }
}
