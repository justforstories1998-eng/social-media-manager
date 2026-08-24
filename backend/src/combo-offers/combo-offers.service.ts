import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { CreateComboOfferDto } from './dto/create-combo-offer.dto';
import { UpdateComboOfferDto } from './dto/update-combo-offer.dto';

@Injectable()
export class ComboOffersService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async create(userId: string, dto: CreateComboOfferDto) {
    const { productIds, ...data } = dto;

    return this.prisma.comboOffer.create({
      data: {
        userId,
        ...data,
        products: {
          create: productIds.map((productId) => ({ productId })),
        },
      },
      include: {
        products: {
          include: { product: true },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.comboOffer.findMany({
      where: { userId },
      include: {
        products: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const combo = await this.prisma.comboOffer.findFirst({
      where: { id, userId },
      include: {
        products: {
          include: { product: true },
        },
      },
    });

    if (!combo) {
      throw new NotFoundException('Combo offer not found');
    }

    return combo;
  }

  async update(id: string, userId: string, dto: UpdateComboOfferDto) {
    await this.findById(id, userId);

    const { productIds, ...data } = dto;

    if (productIds) {
      await this.prisma.comboOfferProduct.deleteMany({
        where: { comboOfferId: id },
      });

      return this.prisma.comboOffer.update({
        where: { id },
        data: {
          ...data,
          products: {
            create: productIds.map((productId) => ({ productId })),
          },
        },
        include: {
          products: {
            include: { product: true },
          },
        },
      });
    }

    return this.prisma.comboOffer.update({
      where: { id },
      data,
      include: {
        products: {
          include: { product: true },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);

    return this.prisma.comboOffer.delete({
      where: { id },
    });
  }

  async analyzeProducts(userId: string, productIds: string[]) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, userId },
    });

    if (products.length === 0) {
      throw new BadRequestException('No valid products found');
    }

    const productInfo = products
      .map(
        (p, i) =>
          `${i + 1}. ${p.name}: ${p.description || 'No description'} | Category: ${p.category || 'Unknown'} | Price: ${p.currency} ${p.price || 0} | Features: ${(p.features || []).join(', ')} | Images: ${(p.images || []).length}`,
      )
      .join('\n');

    const prompt = `Analyze these ${products.length} products and create a combo offer concept.

PRODUCTS:
${productInfo}

Return JSON:
{
  "concept": "short combo name (e.g. 'Complete Home Coffee Bundle')",
  "description": "why these products work together (2-3 sentences)",
  "targetAudience": "suggested target audience",
  "suggestedDiscount": "suggested discount percentage",
  "visualStyle": "suggested visual style (e.g. 'Premium studio', 'Lifestyle', 'E-commerce')",
  "sellingAngle": "strongest selling angle for this bundle",
  "ideas": [
    {"name": "idea name", "description": "brief description"},
    {"name": "idea name 2", "description": "brief description 2"}
  ]
}`;

    const result = await this.aiService.generateContent(prompt, 'analysis', userId);

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      return jsonMatch
        ? JSON.parse(jsonMatch[0])
        : {
            concept: products.map((p) => p.name).join(' + '),
            description: 'A bundled offer',
            ideas: [],
          };
    } catch {
      return {
        concept: products.map((p) => p.name).join(' + '),
        description: 'A bundled offer',
        ideas: [],
      };
    }
  }

  async generateImagePrompt(userId: string, comboOfferId: string) {
    const combo = await this.findById(comboOfferId, userId);
    const products = combo.products.map((cp) => cp.product);

    const productList = products
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} - ${p.description || ''} (${p.category || 'product'})`,
      )
      .join('\n');

    const prompt = `Create a premium commercial product advertisement featuring these ${products.length} products together as a cohesive bundle.

PRODUCTS:
${productList}

COMBO CONCEPT: ${combo.aiConcept || combo.name}
VISUAL STYLE: ${combo.visualStyle || 'Premium commercial'}
PLATFORM: ${combo.platform || 'Instagram'}

Arrange all products naturally in one visually appealing composition. 
Preserve the recognizable appearance of each product.
Create a premium advertising environment with professional lighting, 
realistic shadows, elegant composition, and high-end commercial aesthetics.

Return JSON:
{
  "prompt": "detailed image generation prompt",
  "concept": "visual concept description"
}`;

    const result = await this.aiService.generateContent(prompt, 'image-prompt', userId);

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { prompt: result.content };

      await this.prisma.comboOffer.update({
        where: { id: comboOfferId },
        data: { imagePrompt: parsed.prompt },
      });

      return parsed;
    } catch {
      return { prompt: result.content };
    }
  }
}
