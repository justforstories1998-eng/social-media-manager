import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAIGenerationDto } from './dto/create-ai-generation.dto';
import { UpdateAIGenerationDto } from './dto/update-ai-generation.dto';

@Injectable()
export class AIGenerationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateAIGenerationDto) {
    return this.prisma.aIGeneration.create({
      data: {
        userId,
        productId: data.productId,
        postId: data.postId,
        type: data.type,
        status: 'pending',
        prompt: data.prompt,
        revisedPrompt: data.revisedPrompt,
        model: data.model,
        provider: data.provider,
        width: data.width,
        height: data.height,
        duration: data.duration,
        seed: data.seed,
      },
    });
  }

  async update(id: string, userId: string, data: UpdateAIGenerationDto) {
    const generation = await this.prisma.aIGeneration.findUnique({ where: { id } });
    if (!generation) throw new NotFoundException('AI generation not found');
    if (generation.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.aIGeneration.update({
      where: { id },
      data,
    });
  }

  async findByUser(userId: string, type?: string) {
    return this.prisma.aIGeneration.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProduct(productId: string, userId: string) {
    return this.prisma.aIGeneration.findMany({
      where: { productId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPost(postId: string, userId: string) {
    return this.prisma.aIGeneration.findMany({
      where: { postId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const generation = await this.prisma.aIGeneration.findUnique({ where: { id } });
    if (!generation) throw new NotFoundException('AI generation not found');
    if (generation.userId !== userId) throw new ForbiddenException('Access denied');
    return generation;
  }
}
