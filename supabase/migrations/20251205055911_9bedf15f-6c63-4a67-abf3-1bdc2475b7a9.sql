-- Allow admins to view all events for analytics
CREATE POLICY "Admins can view all events"
ON public.events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));