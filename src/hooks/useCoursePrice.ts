import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  amount: number;
  currency: string;
}

export const useCoursePrice = () => {
  const { data: price, isLoading: loading } = useQuery({
    queryKey: ['course-price'],
    queryFn: async (): Promise<PriceData> => {
      const { data, error } = await supabase.functions.invoke('get-price');
      if (error || !data?.amount) {
        return { amount: 139, currency: 'aud' };
      }
      return { amount: data.amount, currency: data.currency || 'usd' };
    },
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });

  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: price?.currency?.toUpperCase() || 'USD',
  }).format(price?.amount ?? 99);

  return { 
    price: price ?? { amount: 99, currency: 'usd' }, 
    formattedPrice, 
    loading 
  };
};

// Export function to invalidate price cache
export const useInvalidateCoursePrice = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['course-price'] });
};
