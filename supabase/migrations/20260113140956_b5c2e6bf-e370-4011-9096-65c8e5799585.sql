-- Add new course settings keys
INSERT INTO course_settings (key, value, description) VALUES
  ('course_title', 'A.I - Ready Family Framework', 'The main title of the course'),
  ('course_description', 'A comprehensive course helping parents navigate the AI age with confidence.', 'Course description shown on landing page'),
  ('stripe_price_id', 'price_1SaqpSQLJHCz1zk9H6YyndT4', 'Stripe Price ID for the course'),
  ('branding_primary_color', '#0d9488', 'Primary brand color (hex)'),
  ('branding_secondary_color', '#f97316', 'Secondary brand color (hex)'),
  ('branding_logo_url', '', 'URL to the uploaded logo image')
ON CONFLICT (key) DO NOTHING;

-- Create branding storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload branding assets
CREATE POLICY "Admins can upload branding assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'branding' AND
  public.has_role(auth.uid(), 'admin')
);

-- Anyone can view branding assets (public bucket)
CREATE POLICY "Anyone can view branding assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'branding');

-- Admins can update branding assets
CREATE POLICY "Admins can update branding assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'branding' AND
  public.has_role(auth.uid(), 'admin')
);

-- Admins can delete branding assets
CREATE POLICY "Admins can delete branding assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'branding' AND
  public.has_role(auth.uid(), 'admin')
);