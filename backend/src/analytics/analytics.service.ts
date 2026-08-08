import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const totalPosts = await this.prisma.post.count({
      where: { userId },
    });

    const publishedPosts = await this.prisma.post.count({
      where: { userId, status: 'PUBLISHED' },
    });

    const analytics = await this.prisma.analytics.aggregate({
      where: { userId },
      _sum: {
        reach: true,
        impressions: true,
        likes: true,
        comments: true,
        shares: true,
        clicks: true,
      },
      _avg: {
        engagementRate: true,
      },
    });

    const recentPosts = await this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        analytics: true,
      },
    });

    return {
      totalPosts,
      publishedPosts,
      totalReach: analytics._sum.reach || 0,
      totalImpressions: analytics._sum.impressions || 0,
      totalLikes: analytics._sum.likes || 0,
      totalComments: analytics._sum.comments || 0,
      totalShares: analytics._sum.shares || 0,
      totalClicks: analytics._sum.clicks || 0,
      averageEngagementRate: analytics._avg.engagementRate || 0,
      recentPosts,
    };
  }

  async getPlatformStats(userId: string, platform: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        userId,
        platforms: { has: platform },
      },
      include: {
        analytics: true,
      },
    });

    const analytics = posts
      .filter((post) => post.analytics)
      .map((post) => post.analytics);

    const totalReach = analytics.reduce((sum, a) => sum + (a?.reach || 0), 0);
    const totalImpressions = analytics.reduce((sum, a) => sum + (a?.impressions || 0), 0);
    const totalLikes = analytics.reduce((sum, a) => sum + (a?.likes || 0), 0);
    const totalComments = analytics.reduce((sum, a) => sum + (a?.comments || 0), 0);
    const totalShares = analytics.reduce((sum, a) => sum + (a?.shares || 0), 0);
    const totalClicks = analytics.reduce((sum, a) => sum + (a?.clicks || 0), 0);
    const avgEngagement = analytics.length
      ? analytics.reduce((sum, a) => sum + (a?.engagementRate || 0), 0) / analytics.length
      : 0;

    return {
      platform,
      totalPosts: posts.length,
      totalReach,
      totalImpressions,
      totalLikes,
      totalComments,
      totalShares,
      totalClicks,
      averageEngagementRate: avgEngagement,
    };
  }
}
