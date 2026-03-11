import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFoundingSpots = () => {
  const { data: spotsRemaining, isLoading } = useQuery({
    queryKey: ['founding-spots'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_founding_spots_remaining');
      if (error) throw error;
      return data as number;
    },
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });

  const spots = spotsRemaining ?? 100;
  const spotsTaken = 100 - spots;
  const isUrgent = spots <= 20;
  const isSoldOut = spots <= 0;

  return { spots, spotsTaken, isUrgent, isSoldOut, isLoading };
};
