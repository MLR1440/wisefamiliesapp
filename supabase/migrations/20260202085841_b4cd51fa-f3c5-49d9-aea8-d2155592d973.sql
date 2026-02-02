-- Allow anonymous visitors to read course settings (public branding info)
CREATE POLICY "Anyone can read settings" 
ON public.course_settings 
FOR SELECT 
TO anon
USING (true);