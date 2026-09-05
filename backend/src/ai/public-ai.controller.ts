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
  async testNvidia(@Body() body: { endpoint?: string }) {
    const apiKey = this.configService.get('NVIDIA_API_KEY') || '';
    const model = 'black-forest-labs/flux.2-klein-4b';

    const results: any = {};

    // Test 1: Without image field
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
      results.klein_no_image = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts, artifactCount: res.data?.artifacts?.length };
    } catch (e: any) {
      results.klein_no_image = { status: e.response?.status, data: JSON.stringify(e.response?.data || e.message).substring(0, 500) };
    }

    // Test 2: With image as empty string
    try {
      const res = await axios.post(`https://ai.api.nvidia.com/v1/genai/${model}`, {
        prompt: 'a macro wildlife photo of a green frog in a rainforest pond',
        image: '',
        width: 1024,
        height: 1024,
        seed: 0,
        steps: 4,
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 120000,
      });
      results.klein_empty_string = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts, artifactCount: res.data?.artifacts?.length };
    } catch (e: any) {
      results.klein_empty_string = { status: e.response?.status, data: JSON.stringify(e.response?.data || e.message).substring(0, 500) };
    }

    // Test 3: Schnell without image
    try {
      const res = await axios.post(`https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell`, {
        prompt: 'a macro wildlife photo of a green frog in a rainforest pond',
        width: 1024,
        height: 1024,
        seed: 42,
        steps: 4,
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 120000,
      });
      results.schnell_no_image = { status: res.status, keys: Object.keys(res.data || {}), hasArtifacts: !!res.data?.artifacts };
    } catch (e: any) {
      results.schnell_no_image = { status: e.response?.status, data: JSON.stringify(e.response?.data || e.message).substring(0, 500) };
    }

    return results;
  }

  @Post('trace-generate')
  async traceGenerate(@Body() body: { prompt?: string; model?: string }) {
    const apiKey = this.configService.get('NVIDIA_API_KEY') || '';
    const steps: any[] = [];
    const prompt = body.prompt || 'a beautiful sunset over mountains';
    const model = body.model || 'black-forest-labs/flux.2-klein-4b';
    const width = 1024;
    const height = 1024;

    // Step 1: Check env
    steps.push({ step: 1, name: 'env_check', nvidia_key: !!apiKey, model, width, height });

    // Step 2: Check provider registry
    try {
      const providerRegistry = new (await import('./providers/provider-registry')).ProviderRegistry();
      const nvidiaProvider = new (await import('./providers/nvidia.provider')).NvidiaProvider(this.configService);
      const available = await nvidiaProvider.isAvailable();
      providerRegistry.registerImageProvider(nvidiaProvider);
      steps.push({ step: 2, name: 'provider_init', available });
    } catch (e: any) {
      steps.push({ step: 2, name: 'provider_init', error: e.message });
    }

    // Step 3: Call NVIDIA API directly (same as provider does)
    const payload = {
      prompt,
      width,
      height,
      seed: 0,
      steps: 4,
    };
    steps.push({ step: 3, name: 'nvidia_payload', payload: { ...payload, prompt: prompt.substring(0, 50) + '...' } });

    try {
      const res = await require('axios').default.post(
        `https://ai.api.nvidia.com/v1/genai/${model}`,
        payload,
        {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 120000,
        }
      );
      const hasArtifacts = !!res.data?.artifacts;
      const artifactCount = res.data?.artifacts?.length || 0;
      steps.push({ step: 4, name: 'nvidia_call', status: res.status, hasArtifacts, artifactCount });
    } catch (e: any) {
      steps.push({ step: 4, name: 'nvidia_call', status: e.response?.status, data: JSON.stringify(e.response?.data || e.message).substring(0, 300) });
    }

    // Step 5: Check if Prisma AIGeneration table exists
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const count = await prisma.aIGeneration.count();
      steps.push({ step: 5, name: 'aigeneration_table', exists: true, count });
      await prisma.$disconnect();
    } catch (e: any) {
      steps.push({ step: 5, name: 'aigeneration_table', error: e.message?.substring(0, 200) });
    }

    return { steps };
  }
}
