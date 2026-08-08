import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  constructor(private prisma: PrismaService) {}

  async schedulePost(userId: string, postId: string, platforms: string[], scheduledFor: Date) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, userId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== 'APPROVED') {
      throw new BadRequestException('Post must be approved before scheduling');
    }

    const scheduledPost = await this.prisma.scheduledPost.create({
      data: {
        userId,
        postId,
        platforms,
        scheduledFor,
        status: 'pending',
      },
    });

    // Update post status to SCHEDULED
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: 'SCHEDULED', scheduledFor },
    });

    return scheduledPost;
  }

  async getQueue(userId: string) {
    return this.prisma.scheduledPost.findMany({
      where: { userId },
      orderBy: { scheduledFor: 'asc' },
      include: {
        post: true,
      },
    });
  }

  async cancelSchedule(id: string, userId: string) {
    const scheduledPost = await this.prisma.scheduledPost.findFirst({
      where: { id, userId },
    });

    if (!scheduledPost) {
      throw new NotFoundException('Scheduled post not found');
    }

    // Update post status back to APPROVED
    if (scheduledPost.postId) {
      await this.prisma.post.update({
        where: { id: scheduledPost.postId },
        data: { status: 'APPROVED', scheduledFor: null },
      });
    }

    return this.prisma.scheduledPost.delete({
      where: { id },
    });
  }
}
