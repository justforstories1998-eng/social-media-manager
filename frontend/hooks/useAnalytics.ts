import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface DashboardMetrics {
  todayPosts: number;
  scheduled: number;
  reachThisWeek: string;
  engagement: string;
  recentPosts: {
    id: string;
    title: string;
    platform: string;
    status: string;
    scheduledAt: string | null;
  }[];
  platformStats: { name: string; reach: string; engagement: string }[];
  aiUsage: { tokens: number; model: string; percentage: number; postsRemaining: number };
  activities: string[];
}

interface PlatformStats {
  platform: string;
  reach: string;
  engagement: string;
  posts: number;
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const res = await api.get<DashboardMetrics>('/analytics/dashboard');
      return res.data;
    },
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['analytics', 'platforms'],
    queryFn: async () => {
      const platforms = ['instagram', 'linkedin', 'facebook'];
      const results = await Promise.all(
        platforms.map((p) => api.get<PlatformStats>(`/analytics/platform/${p}`))
      );
      return results.map((r) => r.data);
    },
  });
}
