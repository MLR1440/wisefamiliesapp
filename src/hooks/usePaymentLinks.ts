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
      const { data: settings, error } = await supabase
        .from('course_settings')
        .select('key, value')
        .in('key', ['payment_link_core', 'payment_link_core_installments', 'payment_link_premium']);

      if (error) {
        console.error('Error fetching payment links:', error);
        return { coreLink: null, coreInstallmentsLink: null, premiumLink: null };
      }

      const coreLink = settings?.find(s => s.key === 'payment_link_core')?.value || null;
      const coreInstallmentsLink = settings?.find(s => s.key === 'payment_link_core_installments')?.value || null;
      const premiumLink = settings?.find(s => s.key === 'payment_link_premium')?.value || null;

      return { coreLink, coreInstallmentsLink, premiumLink };
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
