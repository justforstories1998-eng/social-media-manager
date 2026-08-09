import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { type BusinessProfile } from '@/lib/api';

export function useBusinessProfile() {
  return useQuery({
    queryKey: ['business', 'profile'],
    queryFn: async () => {
      const res = await api.get<BusinessProfile>('/business/profile');
      return res.data;
    },
  });
}

export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<BusinessProfile>) => {
      const res = await api.put<BusinessProfile>('/business/profile', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'profile'] });
    },
  });
}
