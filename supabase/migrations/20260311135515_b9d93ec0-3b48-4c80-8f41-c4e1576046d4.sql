-- Update public-safe settings whitelist to include stripe_price_id_premium
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
    'course_completion_enabled'
  )
);