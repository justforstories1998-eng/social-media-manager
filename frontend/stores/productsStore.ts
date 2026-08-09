import { create } from 'zustand';
import api, { type Product } from '@/lib/api';

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (data: { name: string; category: string; price: number; description?: string; emoji?: string }) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Product[]>('/products');
      set({ products: res.data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      set({ error: message, isLoading: false });
    }
  },

  createProduct: async (data) => {
    const res = await api.post<Product>('/products', data);
    set((state) => ({ products: [res.data, ...state.products] }));
    return res.data;
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
  },
}));
