import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const todayPosts = await this.prisma.post.count({
      where: { userId, createdAt: { gte: todayStart } },
    });

    const scheduled = await this.prisma.post.count({
      where: { userId, status: 'SCHEDULED' },
    });

    const recentPosts = await this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const analytics = await this.prisma.analytics.aggregate({
      where: { userId, date: { gte: weekStart } },
      _sum: { reach: true },
      _avg: { engagementRate: true },
    });

    return {
      todayPosts,
      scheduled,
      reachThisWeek: this.formatNumber(analytics._sum.reach || 0),
      engagement: `${((analytics._avg.engagementRate || 0) * 100).toFixed(1)}%`,
      recentPosts: recentPosts.map((p) => ({
        id: p.id,
        title: p.title || p.caption?.substring(0, 50) || 'Untitled Post',
        platform: p.platforms?.[0] || 'Instagram',
        status: p.status,
        scheduledAt: p.scheduledFor ? new Date(p.scheduledFor).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
      })),
      platformStats: [
        { name: 'Instagram', reach: '0', engagement: '0%' },
        { name: 'LinkedIn', reach: '0', engagement: '0%' },
        { name: 'Facebook', reach: '0', engagement: '0%' },
      ],
      aiUsage: { tokens: 0, model: 'QWEN2.5-7B', percentage: 0, postsRemaining: 10 },
      activities: ['Welcome to WonderMedia! Start by creating your first post.'],
    };
  }

  async getPlatformStats(userId: string, platform: string) {
    const posts = await this.prisma.post.findMany({
      where: { userId, platforms: { has: platform } },
      include: { analytics: true },
    });

    const analytics = posts.filter((p) => p.analytics).map((p) => p.analytics);

    return {
      platform,
      totalPosts: posts.length,
      totalReach: analytics.reduce((sum, a) => sum + (a?.reach || 0), 0),
      totalImpressions: analytics.reduce((sum, a) => sum + (a?.impressions || 0), 0),
      totalLikes: analytics.reduce((sum, a) => sum + (a?.likes || 0), 0),
      totalComments: analytics.reduce((sum, a) => sum + (a?.comments || 0), 0),
      totalShares: analytics.reduce((sum, a) => sum + (a?.shares || 0), 0),
      totalClicks: analytics.reduce((sum, a) => sum + (a?.clicks || 0), 0),
      averageEngagementRate: analytics.length
        ? analytics.reduce((sum, a) => sum + (a?.engagementRate || 0), 0) / analytics.length
        : 0,
    };
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return String(num);
  }
}
