-- Drop overly permissive public read policies
DROP POLICY IF EXISTS "Anyone can read settings" ON public.course_settings;
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.course_settings;

-- Allow public access ONLY to non-sensitive setting keys
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
    'hero_video_url',
    'hero_video_type',
    'course_name',
    'course_subtitle',
    'branding_logo_url'
  )
);

-- Authenticated users with course access can read all settings
CREATE POLICY "Course users can read all settings"
ON public.course_settings
FOR SELECT
TO authenticated
USING (user_has_course_access(auth.uid()));