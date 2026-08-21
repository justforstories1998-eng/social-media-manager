import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Post {
  id: string;
  title: string | null;
  caption: string;
  content: string;
  platform: string;
  platformContent: string | null;
  platforms: string[];
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  reach: number | null;
  engagement: number | null;
  imageUrl: string | null;
  videoUrl: string | null;
  hashtags: string[];
  userId: string;
  product: Product | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  status: string;
  imageUrl: string | null;
  images: string[];
  emoji: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  website: string | null;
  voice: string | null;
  brandVoice: string | null;
  audience: string | null;
  targetAudience: string | null;
  primaryColor: string;
  secondaryColor: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Export {
  id: string;
  type: string;
  format: string;
  status: string;
  fileUrl: string | null;
  fileSize: number | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  todayPosts: number;
  scheduled: number;
  reachThisWeek: string;
  engagement: string;
  recentPosts: Post[];
  platformStats: { name: string; reach: string; engagement: string }[];
  aiUsage: { tokens: number; model: string; percentage: number; postsRemaining: number };
  activities: string[];
}

export interface PlatformStats {
  platform: string;
  reach: string;
  engagement: string;
  posts: number;
}

export interface AdminStats {
  totalUsers: number;
  activeBusinesses: number;
  postsGenerated: string;
  aiTokensUsed: string;
  recentUsers: { name: string; email: string; joined: string }[];
  systemHealth: { name: string; status: string }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface TelegramSettings {
  botToken: string;
  chatId: string;
  channelId: string;
  groupId: string;
  enabled: boolean;
}

export interface GeneratePostRequest {
  prompt: string;
  platform: string;
  type: string;
}

export interface GeneratePostResponse {
  caption: string;
  hashtags: string;
  imagePrompt: string;
  model: string;
  confidence: string;
}

export interface AdConcept {
  name: string;
  description: string;
  prompt: string;
}

export interface AdImageResponse {
  imageUrl: string;
  prompt: string;
  model: string;
  provider: string;
}

export interface GenerateImageResponse {
  imageUrl: string;
  prompt: string;
  model: string;
  width: number;
  height: number;
  seed: number;
  provider: string;
}

export interface GenerateVideoResponse {
  videoUrl: string;
  prompt: string;
  model: string;
  duration: number;
  provider: string;
}
