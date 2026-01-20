import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StripePrice {
  id: string;
  amount: number;
  currency: string;
  productName: string;
  nickname: string | null;
  recurring: string | null;
}

export const useStripePrices = () => {
  return useQuery({
    queryKey: ['stripe-prices'],
    queryFn: async (): Promise<StripePrice[]> => {
      const { data, error } = await supabase.functions.invoke('list-stripe-prices');
      if (error) throw error;
      return data?.prices || [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};
