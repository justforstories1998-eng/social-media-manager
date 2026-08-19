import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

const FREE_OPENROUTER_MODELS = [
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'Nemotron 3 Ultra', context: '1M tokens', description: 'Best for long-context reasoning' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B', context: '262K tokens', description: 'General purpose, multimodal' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B', context: '262K tokens', description: 'Efficient multimodal model' },
  { id: 'inclusionai/ling-3.0-flash:free', name: 'Ling 3.0 Flash', context: '262K tokens', description: 'Fast general instruction work' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super', context: '262K tokens', description: 'General and agent tasks' },
  { id: 'openai/gpt-oss-20b:free', name: 'GPT-OSS 20B', context: '131K tokens', description: 'OpenAI open-source model' },
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'Nemotron Nano 9B', context: '128K tokens', description: 'Lightweight and fast' },
  { id: 'openrouter/free', name: 'Auto (Free Router)', context: 'varies', description: 'Auto-selects best free model' },
];

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private ollamaUrl: string;
  private openrouterKey: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.ollamaUrl = this.configService.get('OLLAMA_URL') || 'http://localhost:11434';
    this.openrouterKey = this.configService.get('OPENROUTER_API_KEY') || '';
  }

  private get isUsingOpenRouter(): boolean {
    return !!this.openrouterKey;
  }

  async getAvailableModels() {
    if (this.isUsingOpenRouter) {
      return FREE_OPENROUTER_MODELS;
    }

    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      return response.data.models || [];
    } catch {
      return [
        { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', size: '4.7GB' },
        { id: 'llama3.2:1b', name: 'Llama 3.2 1B', size: '1.3GB' },
        { id: 'gemma:2b', name: 'Gemma 2B', size: '1.6GB' },
      ];
    }
  }

  async generateContent(prompt: string, type: string, userId: string, model?: string) {
    const selectedModel = model || await this.getBestModel(type);
    const startTime = Date.now();

    try {
      let result: string;

      if (this.isUsingOpenRouter) {
        result = await this.callOpenRouter(this.buildPrompt(prompt, type), selectedModel);
      } else {
        result = await this.callOllama(this.buildPrompt(prompt, type), selectedModel);
      }

      await this.prisma.aIHistory.create({
        data: {
          userId,
          type,
          prompt,
          model: selectedModel,
          output: { result },
          tokensUsed: result.length,
          durationMs: Date.now() - startTime,
        },
      });

      return { content: result, model: selectedModel, duration: Date.now() - startTime };
    } catch (error) {
      this.logger.error(`AI generation failed: ${error.message}`);
      throw error;
    }
  }

  async generateFullPost(prompt: string, platform: string, type: string, userId: string, model?: string) {
    const selectedModel = model || await this.getBestModel(type);
    const startTime = Date.now();

    const fullPrompt = `Generate a complete social media post for ${platform} in ${type} style.

Business context: ${prompt}

Please respond in this exact JSON format:
{
  "caption": "engaging caption here",
  "hashtags": ["#tag1", "#tag2"],
  "imagePrompt": "detailed image generation prompt",
  "cta": "call to action"
}`;

    try {
      let rawResponse: string;

      if (this.isUsingOpenRouter) {
        rawResponse = await this.callOpenRouter(fullPrompt, selectedModel);
      } else {
        rawResponse = await this.callOllama(fullPrompt, selectedModel, true);
      }

      let parsed;
      try {
        // Try to extract JSON from the response
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawResponse);
      } catch {
        parsed = {
          caption: rawResponse,
          hashtags: ["#marketing", "#social"],
          imagePrompt: prompt,
          cta: "Learn more"
        };
      }

      await this.prisma.aIHistory.create({
        data: {
          userId,
          type: `post_${platform.toLowerCase()}`,
          prompt,
          model: selectedModel,
          output: parsed,
          tokensUsed: rawResponse.length,
          durationMs: Date.now() - startTime,
        },
      });

      return {
        ...parsed,
        model: selectedModel,
        platform,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Full post generation failed: ${error.message}`);
      throw error;
    }
  }

  async generateImagePrompt(prompt: string, userId: string, brandColors: string[] = [], model?: string) {
    const selectedModel = model || await this.getBestModel('image');

    const enhancedPrompt = `Create a highly detailed, professional image generation prompt for Stable Diffusion / FLUX.

Subject: ${prompt}
Brand colors: ${brandColors.length ? brandColors.join(', ') : 'Modern violet and pink accents'}
Style: Cinematic product photography, high detail, modern aesthetic, premium feel

Respond with only the final image prompt.`;

    try {
      let result: string;

      if (this.isUsingOpenRouter) {
        result = await this.callOpenRouter(enhancedPrompt, selectedModel);
      } else {
        result = await this.callOllama(enhancedPrompt, selectedModel);
      }

      return {
        prompt: result.trim(),
        model: selectedModel,
        suggestedStyle: "photorealistic",
      };
    } catch (error) {
      return {
        prompt: `${prompt}, professional product photography, clean background, high detail`,
        model: "fallback",
      };
    }
  }

  private async getBestModel(task: string): Promise<string> {
    if (this.isUsingOpenRouter) {
      return 'openrouter/free';
    }

    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      const models = response.data.models || [];

      const modelPriority = [
        'gemma:2b', 'qwen2:1.5b', 'llama3.2:1b', 'phi3:mini',
        'mistral:7b', 'llama3:8b', 'qwen2:7b', 'deepseek-coder:6.7b'
      ];

      for (const model of modelPriority) {
        if (models.some((m: any) => m.name.includes(model.split(':')[0]))) {
          return model;
        }
      }
      return 'llama3.2:1b';
    } catch (error) {
      return 'llama3.2:1b';
    }
  }

  private async callOpenRouter(prompt: string, model: string): Promise<string> {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openrouterKey}`,
          'HTTP-Referer': 'https://wondermedia.vercel.app',
          'X-Title': 'WonderMedia',
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  }

  private async callOllama(prompt: string, model: string, jsonFormat = false): Promise<string> {
    const body: any = {
      model,
      prompt,
      stream: false,
      options: { temperature: 0.7, num_predict: 1000 },
    };

    if (jsonFormat) {
      body.format = 'json';
    }

    const response = await axios.post(`${this.ollamaUrl}/api/generate`, body);
    return response.data.response;
  }

  private buildPrompt(userPrompt: string, type: string): string {
    const basePrompts: Record<string, string> = {
      caption: `You are an expert social media copywriter. Generate an engaging, brand-aligned caption for the following. Keep it under 280 characters. Include relevant emojis.\n\n${userPrompt}`,
      hashtags: `Generate 8-12 highly relevant, trending hashtags for this post. Mix broad and niche tags.\n\n${userPrompt}`,
      image_prompt: `Create a detailed Stable Diffusion prompt for generating a professional social media image: ${userPrompt}. Include: brand colors, product focus, modern aesthetic, high quality.`,
      video_script: `Write a 15-30 second short video script with scene descriptions, voiceover text, and text overlays.\n\n${userPrompt}`,
      marketing_post: `Write a compelling promotional social media post. Focus on benefits and clear CTA.\n\n${userPrompt}`,
    };

    return basePrompts[type] || userPrompt;
  }

  async generateDailyContent(userId: string, businessProfile: any, products: any[]) {
    const today = new Date().toISOString().split('T')[0];

    const existing = await this.prisma.aIHistory.count({
      where: {
        userId,
        createdAt: { gte: new Date(today) },
        type: { in: ['daily_post_1', 'daily_post_2'] }
      }
    });

    if (existing >= 2) {
      return { message: "Daily content limit reached (1-2 posts/day)" };
    }

    const postIdeas = await this.generatePostIdeas(businessProfile, products);

    const generatedPosts: { idea: any; caption: any; model: string }[] = [];
    for (let i = 0; i < Math.min(2, postIdeas.length); i++) {
      const idea = postIdeas[i];
      const caption = await this.generateContent(idea.prompt, 'caption', userId);

      generatedPosts.push({
        idea,
        caption: caption.content,
        model: caption.model,
      });
    }

    return generatedPosts;
  }

  async generatePostIdeas(business: any, products: any[]) {
    const occasions = this.getRelevantOccasions();
    const ideas: { type: string; prompt: string; occasion: string }[] = [];

    if (products.length > 0) {
      const product = products[0];
      ideas.push({
        type: 'product_promotion',
        prompt: `Promote ${product.name} for a business in ${business.industry}. Focus on: ${product.benefits?.join(', ')}`,
        occasion: occasions[0] || 'Regular marketing',
      });
    }

    if (occasions.length > 0) {
      ideas.push({
        type: 'event_based',
        prompt: `Create content for ${occasions[0]} related to ${business.businessName} and their products.`,
        occasion: occasions[0],
      });
    }

    return ideas;
  }

  private getRelevantOccasions(): string[] {
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const occasions: string[] = [];

    if (month === 4 && day === 22) occasions.push('Earth Day');
    if (month === 12 && day === 25) occasions.push('Christmas');
    if (month === 1 && day === 1) occasions.push('New Year');
    if (month === 2 && day === 14) occasions.push('Valentine\'s Day');

    return occasions.length > 0 ? occasions : ['General Marketing Day'];
  }

  async generateAdConcepts(productName: string, category: string, description: string, imageUrl?: string) {
    const prompt = `You are a creative advertising director. Analyze this product and suggest 6 advertising concepts.

Product Name: ${productName}
Category: ${category || 'General'}
Description: ${description || 'No description provided'}
${imageUrl ? `Product Image: ${imageUrl}` : ''}

For each concept, provide:
- name: Short catchy name (e.g., "Lifestyle Morning Ad")
- description: 1-2 sentence description of the concept
- prompt: A detailed image generation prompt for Stable Diffusion / FLUX that describes the scene, lighting, composition, and mood. The prompt should be cinematic, high-quality, and professional.

Respond in this exact JSON format:
{
  "concepts": [
    {
      "name": "Concept Name",
      "description": "Brief description",
      "prompt": "Detailed image generation prompt..."
    }
  ]
}

Make the concepts diverse: include lifestyle, promotional, minimal, seasonal, social media, and editorial styles.`;

    try {
      let rawResponse: string;
      if (this.isUsingOpenRouter) {
        rawResponse = await this.callOpenRouter(prompt, 'openrouter/free');
      } else {
        rawResponse = await this.callOllama(prompt, 'llama3.2:1b', true);
      }

      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawResponse);
      return parsed.concepts || [];
    } catch (error) {
      this.logger.error(`Ad concept generation failed: ${error.message}`);
      return [
        { name: 'Lifestyle Ad', description: 'Product in a natural lifestyle setting', prompt: `${productName}, professional product photography, lifestyle setting, warm natural lighting, cinematic, 4k, high detail` },
        { name: 'Minimal Showcase', description: 'Clean minimal product display', prompt: `${productName}, minimal product photography, clean white background, soft shadows, studio lighting, premium feel` },
        { name: 'Social Media Creative', description: 'Engaging social media style', prompt: `${productName}, social media product photo, vibrant colors, modern aesthetic, Instagram style, high quality` },
      ];
    }
  }

  async generateAdImage(prompt: string, width = 1024, height = 1024) {
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true`;

    try {
      // Verify the image is accessible
      const response = await axios.head(imageUrl, { timeout: 10000 });
      if (response.status === 200) {
        return { imageUrl, prompt, model: 'flux', provider: 'pollinations' };
      }
    } catch (error) {
      this.logger.warn(`Pollinations image verification failed: ${error.message}`);
    }

    // Return the URL anyway - Pollinations may still generate it on first access
    return { imageUrl, prompt, model: 'flux', provider: 'pollinations' };
  }

  async generateImage(prompt: string, model = 'flux', width = 1024, height = 1024, seed?: number) {
    const encodedPrompt = encodeURIComponent(prompt);
    const seedParam = seed ? `&seed=${seed}` : '';
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&width=${width}&height=${height}${seedParam}&nologo=true`;

    return {
      imageUrl,
      prompt,
      model,
      width,
      height,
      seed: seed || Math.floor(Math.random() * 1000000),
      provider: 'pollinations',
    };
  }

  async generateVideo(prompt: string, model = 'stable-video', duration = 5) {
    const encodedPrompt = encodeURIComponent(prompt);
    const videoUrl = `https://video.pollinations.ai/prompt/${encodedPrompt}?model=${model}&duration=${duration}`;

    return {
      videoUrl,
      prompt,
      model,
      duration,
      provider: 'pollinations',
    };
  }
}
