import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private ollamaUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.ollamaUrl = this.configService.get('OLLAMA_URL') || 'http://localhost:11434';
  }

  // Auto-select smallest model for efficiency
  async getBestModel(task: string): Promise<string> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      const models = response.data.models || [];
      
      // Priority: smallest suitable model
      const modelPriority = [
        'gemma:2b', 'qwen2:1.5b', 'llama3.2:1b', 'phi3:mini',
        'mistral:7b', 'llama3:8b', 'qwen2:7b', 'deepseek-coder:6.7b'
      ];

      for (const model of modelPriority) {
        if (models.some((m: any) => m.name.includes(model.split(':')[0]))) {
          return model;
        }
      }
      return 'llama3.2:1b'; // fallback
    } catch (error) {
      return 'llama3.2:1b';
    }
  }

  async generateContent(prompt: string, type: string, userId: string) {
    const model = await this.getBestModel(type);
    const startTime = Date.now();

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model,
        prompt: this.buildPrompt(prompt, type),
        stream: false,
        options: { temperature: 0.7, num_predict: 500 },
      });

      const result = response.data.response;

      // Log AI usage
      await this.prisma.aIHistory.create({
        data: {
          userId,
          type,
          prompt,
          model,
          output: { result },
          tokensUsed: result.length,
          durationMs: Date.now() - startTime,
        },
      });

      return { content: result, model, duration: Date.now() - startTime };
    } catch (error) {
      this.logger.error(`AI generation failed: ${error.message}`);
      throw error;
    }
  }

  async generateFullPost(prompt: string, platform: string, type: string, userId: string) {
    const model = await this.getBestModel(type);
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
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model,
        prompt: fullPrompt,
        stream: false,
        format: "json",
        options: { temperature: 0.75, num_predict: 700 },
      });

      let parsed;
      try {
        parsed = JSON.parse(response.data.response);
      } catch {
        parsed = {
          caption: response.data.response,
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
          model,
          output: parsed,
          tokensUsed: response.data.response.length,
          durationMs: Date.now() - startTime,
        },
      });

      return {
        ...parsed,
        model,
        platform,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Full post generation failed: ${error.message}`);
      throw error;
    }
  }

  async generateImagePrompt(prompt: string, userId: string, brandColors: string[] = []) {
    const model = await this.getBestModel('image');
    
    const enhancedPrompt = `Create a highly detailed, professional image generation prompt for Stable Diffusion / FLUX.
    
Subject: ${prompt}
Brand colors: ${brandColors.length ? brandColors.join(', ') : 'Modern violet and pink accents'}
Style: Cinematic product photography, high detail, modern aesthetic, premium feel

Respond with only the final image prompt.`;

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model,
        prompt: enhancedPrompt,
        stream: false,
        options: { temperature: 0.6, num_predict: 300 },
      });

      return {
        prompt: response.data.response.trim(),
        model,
        suggestedStyle: "photorealistic",
      };
    } catch (error) {
      return {
        prompt: `${prompt}, professional product photography, clean background, high detail`,
        model: "fallback",
      };
    }
  }

  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      return response.data.models || [];
    } catch {
      return [
        { name: "qwen2.5:7b", size: "4.7GB" },
        { name: "llama3.2:1b", size: "1.3GB" },
        { name: "gemma:2b", size: "1.6GB" },
      ];
    }
  }

  private buildPrompt(userPrompt: string, type: string): string {
    const basePrompts = {
      caption: `You are an expert social media copywriter. Generate an engaging, brand-aligned caption for the following. Keep it under 280 characters. Include relevant emojis.\n\n${userPrompt}`,
      hashtags: `Generate 8-12 highly relevant, trending hashtags for this post. Mix broad and niche tags.\n\n${userPrompt}`,
      image_prompt: `Create a detailed Stable Diffusion prompt for generating a professional social media image: ${userPrompt}. Include: brand colors, product focus, modern aesthetic, high quality.`,
      video_script: `Write a 15-30 second short video script with scene descriptions, voiceover text, and text overlays.\n\n${userPrompt}`,
      marketing_post: `Write a compelling promotional social media post. Focus on benefits and clear CTA.\n\n${userPrompt}`,
    };

    return basePrompts[type] || userPrompt;
  }

  // Generate 1-2 daily posts only (as per requirements)
  async generateDailyContent(userId: string, businessProfile: any, products: any[]) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already generated today
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
    // Intelligent daily planner
    const occasions = this.getRelevantOccasions();
    const ideas: { type: string; prompt: string; occasion: string }[] = [];

    // Generate 2 ideas max
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

    // Basic calendar awareness
    if (month === 4 && day === 22) occasions.push('Earth Day');
    if (month === 12 && day === 25) occasions.push('Christmas');
    if (month === 1 && day === 1) occasions.push('New Year');
    if (month === 2 && day === 14) occasions.push('Valentine\'s Day');
    
    // Add more intelligent festival detection in real implementation
    return occasions.length > 0 ? occasions : ['General Marketing Day'];
  }
}