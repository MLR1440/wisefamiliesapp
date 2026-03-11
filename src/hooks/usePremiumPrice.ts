import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  amount: number;
  currency: string;
}

export const usePremiumPrice = () => {
  const { data: price, isLoading: loading } = useQuery({
    queryKey: ['premium-price'],
    queryFn: async (): Promise<PriceData> => {
      const { data, error } = await supabase.functions.invoke('get-premium-price');
      if (error || !data?.amount) {
        return { amount: 991, currency: 'aud' };
      }
      return { amount: data.amount, currency: data.currency || 'aud' };
    },
    staleTime: 5 * 60 * 1000,
  });

  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: price?.currency?.toUpperCase() || 'AUD',
  }).format(price?.amount ?? 991);

  return {
    price: price ?? { amount: 991, currency: 'aud' },
    formattedPrice,
    loading,
  };
};
