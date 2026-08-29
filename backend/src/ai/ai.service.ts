import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderRegistry } from './providers/provider-registry';
import { TogetherProvider } from './providers/together.provider';

const FREE_OPENROUTER_MODELS = [
  { id: 'minimax/minimax-m3:free', name: 'MiniMax M3', context: '1M tokens', description: 'Best free model — high quality reasoning and generation' },
  { id: 'poolside/laguna-s-2.1:free', name: 'Laguna S 2.1', context: '128K tokens', description: 'Poolside coding and reasoning model' },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'Nemotron 3 Ultra', context: '1M tokens', description: 'Long-context reasoning powerhouse' },
  { id: 'minimax/minimax-m2.7:free', name: 'MiniMax M2.7', context: '262K tokens', description: 'Fast general purpose model' },
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', name: 'Nemotron Nano Omni', context: '128K tokens', description: 'Lightweight reasoning and multimodal' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B', context: '262K tokens', description: 'Efficient multimodal model' },
];

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private openrouterKey: string;
  private readonly providerRegistry: ProviderRegistry;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openrouterKey = this.configService.get('OPENROUTER_API_KEY') || '';

    this.providerRegistry = new ProviderRegistry();

    const together = new TogetherProvider();
    this.providerRegistry.registerImageProvider(together);
    this.providerRegistry.registerVideoProvider(together);
  }

  async getAvailableModels() {
    return FREE_OPENROUTER_MODELS;
  }

  async generateContent(prompt: string, type: string, userId: string, model?: string) {
    const selectedModel = model || 'minimax/minimax-m3:free';
    const startTime = Date.now();

    try {
      const result = await this.callOpenRouter(this.buildPrompt(prompt, type), selectedModel);

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
    } catch (error: any) {
      this.logger.warn(`OpenRouter failed for generateContent, using local fallback: ${error.message}`);
      return this.generateContentLocal(prompt, type, userId, startTime);
    }
  }

  private generateContentLocal(prompt: string, type: string, userId: string, startTime: number) {
    const productMatch = prompt.match(/Generate 3 content ideas for\s+([^\s:]+)/i);
    const productName = productMatch?.[1] || 'your product';

    const ideas = `1. Product Spotlight - Share a stunning photo of ${productName} with a compelling story about why customers love it. Best for: Instagram Reels or Stories.

2. Behind the Scenes - Show how ${productName} is made or packaged. People love seeing the process! Best for: TikTok or Instagram Reels.

3. Customer Testimonial - Feature a real customer review or create a quote graphic. Social proof sells! Best for: Instagram Feed or Facebook.`;

    this.prisma.aIHistory.create({
      data: {
        userId,
        type,
        prompt,
        model: 'local-fallback',
        output: { result: ideas },
        tokensUsed: ideas.length,
        durationMs: Date.now() - startTime,
      },
    }).catch(() => {});

    return { content: ideas, model: 'local-fallback', duration: Date.now() - startTime };
  }

  async generateFullPost(prompt: string, platform: string, type: string, userId: string, model?: string) {
    const selectedModel = model || 'minimax/minimax-m3:free';
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
      const rawResponse = await this.callOpenRouter(fullPrompt, selectedModel);

      let parsed;
      try {
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
    } catch (error: any) {
      this.logger.warn(`OpenRouter failed, using local fallback: ${error.message}`);
      return this.generateFullPostLocal(prompt, platform, type, userId, startTime);
    }
  }

  private generateFullPostLocal(prompt: string, platform: string, type: string, userId: string, startTime: number) {
    const productMatch = prompt.match(/Product:\s*([^,]+)/i);
    const productName = productMatch?.[1]?.trim() || 'our product';
    const categoryMatch = prompt.match(/Category:\s*([^,]+)/i);
    const category = categoryMatch?.[1]?.trim() || '';
    const descMatch = prompt.match(/Description:\s*(.+)/i);
    const description = descMatch?.[1]?.trim() || '';

    const captions: Record<string, string[]> = {
      Instagram: [
        `✨ Discover ${productName}${category ? ` — your perfect ${category.toLowerCase()}` : ''}! ${description ? description.slice(0, 80) : 'Elevate your everyday.'}\n\n🔥 Ready to level up? Tap the link in bio!\n\n#${productName.replace(/\s+/g, '')} #NewArrival #MustHave`,
        `🚀 Introducing ${productName} — ${description ? description.slice(0, 60) : 'the game-changer you\'ve been waiting for'}!\n\n💫 Why you\'ll love it:\n→ Premium quality\n→ Designed for you\n→ Unbeatable value\n\n🛒 Shop now — link in bio!\n\n#${productName.replace(/\s+/g, '')} #Trending #ShopNow`,
        `💫 ${productName} just dropped and we\'re obsessed!\n\n${description ? description.slice(0, 100) : 'Perfect for every occasion.'}\n\n👇 Drop a 🔥 if you need this!\n\n#${productName.replace(/\s+/g, '')} #Viral #Trending`,
      ],
      Twitter: [
        `🚀 ${productName} is here${category ? ` — the ultimate ${category.toLowerCase()}` : ''}!\n\n${description ? description.slice(0, 100) : 'Game-changing quality at an unbeatable price.'}\n\n#${productName.replace(/\s+/g, '')} #Launch`,
        `💡 Why everyone\'s talking about ${productName}:\n\n→ Premium quality\n→ Amazing value\n→ Perfect for you\n\nDon\'t miss out 👇`,
      ],
      LinkedIn: [
        `Excited to share our latest offering: ${productName}${category ? ` in the ${category} space` : ''}.\n\n${description || 'Built with quality and innovation at its core.'}\n\nWe believe this product represents the future of ${category || 'the industry'}. Would love to hear your thoughts.\n\n#${productName.replace(/\s+/g, '')} #Innovation #Business`,
      ],
      Facebook: [
        `🎉 Big news! ${productName} is now available!\n\n${description ? description.slice(0, 120) : 'We\'ve been working hard on this one and can\'t wait for you to try it.'}\n\n👉 Check it out and let us know what you think!\n\n#${productName.replace(/\s+/g, '')} #NewProduct #Launch`,
      ],
    };

    const platformKey = platform in captions ? platform : 'Instagram';
    const captionOptions = captions[platformKey];
    const caption = captionOptions[Math.floor(Math.random() * captionOptions.length)];

    const parsed = {
      caption,
      hashtags: [`#${productName.replace(/\s+/g, '')}`, '#Marketing', '#SocialMedia', '#Trending', '#NewProduct'],
      imagePrompt: `Professional ${platform.toLowerCase()} post image for ${productName}${category ? ` in ${category}` : ''}. Modern aesthetic, clean design, vibrant colors, premium feel, high quality, 4k.`,
      cta: 'Shop now or visit our page for more!',
    };

    this.prisma.aIHistory.create({
      data: {
        userId,
        type: `post_${platform.toLowerCase()}`,
        prompt,
        model: 'local-fallback',
        output: parsed,
        tokensUsed: caption.length,
        durationMs: Date.now() - startTime,
      },
    }).catch(() => {});

    return {
      ...parsed,
      model: 'local-fallback',
      platform,
      duration: Date.now() - startTime,
    };
  }

  async generateImagePrompt(prompt: string, userId: string, brandColors: string[] = [], model?: string) {
    const selectedModel = model || 'minimax/minimax-m3:free';

    const enhancedPrompt = `Create a highly detailed, professional image generation prompt for Stable Diffusion / FLUX.

Subject: ${prompt}
Brand colors: ${brandColors.length ? brandColors.join(', ') : 'Modern violet and pink accents'}
Style: Cinematic product photography, high detail, modern aesthetic, premium feel

Respond with only the final image prompt.`;

    try {
      const result = await this.callOpenRouter(enhancedPrompt, selectedModel);

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

  private async callOpenRouter(prompt: string, model: string): Promise<string> {
    if (!this.openrouterKey) {
      throw new Error('OpenRouter API key not configured');
    }
    const delays = [0, 1000, 2000];
    let lastError: any;
    for (const delay of delays) {
      if (delay > 0) await new Promise(r => setTimeout(r, delay));
      try {
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
            timeout: 30000,
          }
        );
        return response.data.choices[0].message.content;
      } catch (error: any) {
        lastError = error;
        const status = error.response?.status;
        if (status === 429 || status === 402) {
          this.logger.warn(`OpenRouter rate limited (${status}), retrying...`);
          continue;
        }
        throw error;
      }
    }
    throw lastError;
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
      const rawResponse = await this.callOpenRouter(prompt, 'openrouter/free');

      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawResponse);
      return parsed.concepts || [];
    } catch (error) {
      this.logger.warn(`OpenRouter failed for ad concepts, using local fallback: ${error.message}`);
      return [
        { name: 'Lifestyle Ad', description: 'Product in a natural lifestyle setting', prompt: `${productName}, professional product photography, lifestyle setting, warm natural lighting, cinematic, 4k, high detail` },
        { name: 'Minimal Showcase', description: 'Clean minimal product display', prompt: `${productName}, minimal product photography, clean white background, soft shadows, studio lighting, premium feel` },
        { name: 'Social Media Creative', description: 'Engaging social media style', prompt: `${productName}, social media product photo, vibrant colors, modern aesthetic, Instagram style, high quality` },
        { name: 'Seasonal Promo', description: 'Seasonal promotional style', prompt: `${productName}, seasonal promotional photo, festive atmosphere, warm tones, professional marketing, detailed` },
        { name: 'Flat Lay', description: 'Top-down flat lay composition', prompt: `${productName}, flat lay product photography, top-down view, arranged items, clean background, editorial style` },
        { name: 'Action Shot', description: 'Product in use', prompt: `${productName}, product in use, action shot, dynamic composition, real-world setting, authentic feel, high quality` },
      ];
    }
  }

  async generateAdImage(prompt: string, width = 1024, height = 1024) {
    const hfProvider = new TogetherProvider();
    if (!await hfProvider.isAvailable()) {
      throw new Error('TOGETHER_API_KEY is not set. Add it to Render env vars. Get one free at together.ai — $5 credit included.');
    }

    const models = [
      'black-forest-labs/FLUX.1-schnell-Free',
      'black-forest-labs/FLUX.1-dev',
      'stabilityai/stable-diffusion-xl-base-1.0',
    ];
    let lastError: any;

    for (const m of models) {
      try {
        const result = await hfProvider.generateImage({ prompt, model: m, width, height });
        return { ...result, prompt };
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`Ad image model ${m} failed: ${error.message}`);
      }
    }

    throw lastError || new Error('All image generation models failed');
  }

  async generateImage(prompt: string, model = 'flux', width = 1024, height = 1024, seed?: number) {
    const hfProvider = new TogetherProvider();
    if (!await hfProvider.isAvailable()) {
      throw new Error('TOGETHER_API_KEY is not set. Add it to Render env vars. Get one free at together.ai — $5 credit included.');
    }

    const models = [
      'black-forest-labs/FLUX.1-schnell-Free',
      'black-forest-labs/FLUX.1-dev',
      'stabilityai/stable-diffusion-xl-base-1.0',
    ];
    let lastError: any;

    for (const m of models) {
      try {
        this.logger.log(`Trying image model: ${m}`);
        const result = await hfProvider.generateImage({ prompt, model: m, width, height, seed });
        this.logger.log(`Image generated successfully with ${m}`);
        return { ...result, prompt, width, height, seed: seed || Math.floor(Math.random() * 1000000) };
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`Model ${m} failed: ${error.message}`);
      }
    }

    throw lastError || new Error('All image generation models failed');
  }

  async generateRecommendations(userId: string, date?: string) {
    const [products, posts, scheduledPosts] = await Promise.all([
      this.prisma.product.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
      this.prisma.post.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.scheduledPost.findMany({ where: { userId }, orderBy: { scheduledFor: 'asc' } }),
    ]);

    if (products.length === 0) {
      return {
        recommendations: [],
        message: 'Add products first to get AI recommendations. Go to Products and add your product catalog.',
        stats: { totalProducts: 0, totalPosts: posts.length, scheduledPosts: scheduledPosts.length },
      };
    }

    const dateContext = date
      ? `The user wants content ideas for ${date}. Consider what's relevant for that specific date —季节性 events, weekly patterns, optimal posting times, and what products would perform well on that day.`
      : 'Recommend general content ideas for the coming days.';

    const prompt = `You are a social media strategist. ${dateContext}

PRODUCTS:
${products.map((p, i) => `${i + 1}. ${p.name} (${p.category || 'uncategorized'}) — ${p.description || 'No description'} — Features: ${(p.features || []).join(', ') || 'none'}`).join('\n')}

RECENT POSTS (last 10):
${posts.slice(0, 10).map(p => `- ${p.platforms?.[0] || 'unknown'}: "${(p.caption || '').slice(0, 80)}..." [${p.status}]`).join('\n')}

SCHEDULED: ${scheduledPosts.length} posts already scheduled
PLATFORMS USED: ${[...new Set(posts.map(p => p.platforms?.[0] || 'unknown'))].join(', ') || 'none yet'}

Generate 3 specific, actionable content ideas. Each should be tailored to the specific date if provided.
For each idea, provide:
- product: Which product to feature (use exact product name from the list)
- contentType: "image" or "video" or "post"
- reason: Why this content makes sense right now for this date
- concept: Brief creative concept
- suggestedCaption: A ready-to-use caption draft
- platform: Which platform to post on
- priority: "high" or "medium" or "low"

Return ONLY a JSON array, no other text:
[{"product":"name","contentType":"image","reason":"...","concept":"...","suggestedCaption":"...","platform":"Instagram","priority":"high"}]`;

    const rawResponse = await this.callOpenRouter(prompt, 'openrouter/free').catch(() => '');

    let recommendations;
    try {
      const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      recommendations = [];
    }

    if (recommendations.length === 0 && products.length > 0) {
      recommendations = products.slice(0, 3).map((p, i) => ({
        product: p.name,
        contentType: i % 2 === 0 ? 'image' : 'post',
        reason: `${p.name} hasn't been featured recently. Great opportunity to showcase it.`,
        concept: `Create a visually striking ${i % 2 === 0 ? 'image' : 'post'} highlighting ${p.name}'s key features.`,
        suggestedCaption: `Discover ${p.name} — ${p.description?.slice(0, 60) || 'quality you can trust'}! 🚀`,
        platform: 'Instagram',
        priority: 'high',
      }));
    }

    return {
      recommendations,
      date: date || 'general',
      stats: {
        totalProducts: products.length,
        totalPosts: posts.length,
        scheduledPosts: scheduledPosts.length,
        productsWithoutContent: products.filter(p => !posts.some(post => post.productId === p.id)).length,
      },
    };
  }

  async generateVideo(prompt: string, model = 'stable-video', duration = 5) {
    const hfProvider = new TogetherProvider();
    if (!await hfProvider.isAvailable()) {
      throw new Error('Video generation requires TOGETHER_API_KEY. Get one free at together.ai');
    }
    const result = await hfProvider.generateVideo({ prompt, model: 'ali-vilab/text-to-video-ms-1.7b', duration });
    return { ...result, prompt, duration };
  }
}
