import { create } from 'zustand';
import api, { type Post } from '@/lib/api';

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  createPost: (data: { title: string; content: string; platform: string; type: string }) => Promise<Post>;
  updatePost: (id: string, data: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Post[]>('/posts');
      set({ posts: res.data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      set({ error: message, isLoading: false });
    }
  },

  createPost: async (data) => {
    const res = await api.post<Post>('/posts', data);
    set((state) => ({ posts: [res.data, ...state.posts] }));
    return res.data;
  },

  updatePost: async (id, data) => {
    const res = await api.put<Post>(`/posts/${id}`, data);
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? res.data : p)),
    }));
  },

  deletePost: async (id) => {
    await api.delete(`/posts/${id}`);
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
  },
}));
