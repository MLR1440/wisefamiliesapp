import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFoundingSpots = () => {
  const { data: spotsRemaining, isLoading: spotsLoading } = useQuery({
    queryKey: ['founding-spots'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_founding_spots_remaining');
      if (error) throw error;
      return data as number;
    },
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });

  const { data: totalSpotsData, isLoading: limitLoading } = useQuery({
    queryKey: ['founding-spots-limit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_settings')
        .select('value')
        .eq('key', 'founding_spots_limit')
        .maybeSingle();
      if (error) throw error;
      return data?.value ? parseInt(data.value, 10) : 100;
    },
    staleTime: 5 * 60_000,
  });

  const totalSpots = totalSpotsData ?? 100;
  const spots = spotsRemaining ?? totalSpots;
  const spotsTaken = totalSpots - spots;
  const isUrgent = spots <= 20;
  const isSoldOut = spots <= 0;
  const isLoading = spotsLoading || limitLoading;

  return { spots, spotsTaken, totalSpots, isUrgent, isSoldOut, isLoading };
};
