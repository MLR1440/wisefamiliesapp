
CREATE OR REPLACE FUNCTION public.get_founding_spots_remaining()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT GREATEST(0, 100 - COUNT(*)::integer)
  FROM public.user_purchases
  WHERE refunded = false;
$$;

GRANT EXECUTE ON FUNCTION public.get_founding_spots_remaining() TO anon, authenticated;
