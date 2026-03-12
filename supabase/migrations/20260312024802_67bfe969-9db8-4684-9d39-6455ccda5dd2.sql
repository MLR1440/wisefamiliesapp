
-- Update get_founding_spots_remaining to read limit from course_settings
CREATE OR REPLACE FUNCTION public.get_founding_spots_remaining()
  RETURNS integer
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
  SELECT GREATEST(0, 
    COALESCE(
      (SELECT value::integer FROM public.course_settings WHERE key = 'founding_spots_limit'),
      100
    ) - COUNT(*)::integer
  )
  FROM public.user_purchases WHERE refunded = false;
$$;

-- Add founding_spots_limit to public-read whitelist
DROP POLICY IF EXISTS "Public can read safe settings" ON public.course_settings;
CREATE POLICY "Public can read safe settings"
ON public.course_settings
FOR SELECT
TO anon, authenticated
USING (
  key IN (
    'payment_link_core',
    'payment_link_core_installments',
    'payment_link_premium',
    'stripe_price_id',
    'stripe_price_id_premium',
    'hero_video_url',
    'hero_video_type',
    'course_name',
    'course_subtitle',
    'branding_logo_url',
    'course_completion_enabled',
    'founding_spots_limit'
  )
);
