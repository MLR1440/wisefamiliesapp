-- Drop the overly permissive policy that allows anyone to read settings
DROP POLICY IF EXISTS "Anyone can read settings" ON public.course_settings;

-- Create a new policy that restricts reading to authenticated users only
CREATE POLICY "Authenticated users can read settings"
ON public.course_settings
FOR SELECT
TO authenticated
USING (true);