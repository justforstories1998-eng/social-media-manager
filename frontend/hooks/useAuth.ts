import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { type AuthResponse, type User } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
}

export function useRegister() {
  const register = useAuthStore((s) => s.register);
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      register(name, email, password),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get<User>('/users/me');
      return res.data;
    },
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: async () => {
      logout();
      queryClient.clear();
    },
  });
}
