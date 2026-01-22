import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PaymentLinks {
  coreLink: string | null;
  coreInstallmentsLink: string | null;
  premiumLink: string | null;
}

export const usePaymentLinks = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['payment-links'],
    queryFn: async (): Promise<PaymentLinks> => {
      // Use edge function to fetch payment links (bypasses RLS for public access)
      const { data, error } = await supabase.functions.invoke('get-payment-links');

      if (error) {
        console.error('Error fetching payment links:', error);
        return { coreLink: null, coreInstallmentsLink: null, premiumLink: null };
      }

      return {
        coreLink: data?.coreLink || null,
        coreInstallmentsLink: data?.coreInstallmentsLink || null,
        premiumLink: data?.premiumLink || null,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    coreLink: data?.coreLink ?? null,
    coreInstallmentsLink: data?.coreInstallmentsLink ?? null,
    premiumLink: data?.premiumLink ?? null,
    loading: isLoading,
  };
};
