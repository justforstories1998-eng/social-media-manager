import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { type BusinessProfile } from '@/lib/api';

const defaultProfile: Partial<BusinessProfile> = {
  name: '',
  industry: '',
  website: '',
  voice: '',
  audience: '',
  primaryColor: '#7c3aed',
  secondaryColor: '#ec4899',
};

export function useBusinessProfile() {
  return useQuery({
    queryKey: ['business', 'profile'],
    queryFn: async () => {
      const res = await api.get<BusinessProfile>('/business/profile');
      return res.data;
    },
    retry: false,
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
