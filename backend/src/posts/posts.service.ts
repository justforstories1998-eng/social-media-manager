import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        userId,
        ...createPostDto,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
      },
    });
  }

  async findById(id: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, userId },
      include: {
        product: true,
        history: true,
        scheduledPosts: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto) {
    await this.findById(id, userId);

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);

    return this.prisma.post.delete({
      where: { id },
    });
  }

  async approve(id: string, userId: string) {
    const post = await this.findById(id, userId);

    if (post.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Post is not pending approval');
    }

    return this.prisma.post.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  async publish(id: string, userId: string) {
    const post = await this.findById(id, userId);

    if (post.status !== 'APPROVED') {
      throw new BadRequestException('Post must be approved before publishing');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  async duplicate(id: string, userId: string) {
    const original = await this.findById(id, userId);

    return this.prisma.post.create({
      data: {
        userId,
        title: original.title ? `${original.title} (Copy)` : null,
        caption: original.caption,
        hashtags: original.hashtags,
        platformContent: original.platformContent ?? undefined,
        imageUrl: original.imageUrl,
        videoUrl: original.videoUrl,
        platforms: original.platforms,
        scheduledFor: null,
        status: 'DRAFT',
        aiPrompt: original.aiPrompt,
        aiModel: original.aiModel,
      },
    });
  }
}
