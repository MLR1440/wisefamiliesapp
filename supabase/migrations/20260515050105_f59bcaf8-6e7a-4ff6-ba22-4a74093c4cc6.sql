
-- 1. user_profiles: remove cross-user policy that exposed all columns
DROP POLICY IF EXISTS "Community members can view first names" ON public.user_profiles;

-- Create a SECURITY DEFINER function that returns ONLY first_name
-- and only when both the caller and the target have course access.
CREATE OR REPLACE FUNCTION public.get_community_member_first_name(_member_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT first_name
  FROM public.user_profiles
  WHERE user_id = _member_id
    AND public.user_has_course_access(auth.uid())
    AND public.user_has_course_access(_member_id);
$$;

REVOKE EXECUTE ON FUNCTION public.get_community_member_first_name(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_community_member_first_name(uuid) TO authenticated;

-- 2. quiz_leads: replace permissive INSERT policy with one that validates email format
DROP POLICY IF EXISTS "Anyone can submit quiz" ON public.quiz_leads;

CREATE POLICY "Anyone can submit quiz with valid email"
ON public.quiz_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) <= 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND kit_subscriber_id IS NULL
  AND score >= 0
  AND score <= 100
);

-- 3. Lock down internal SECURITY DEFINER helpers from direct client execution.
-- These are still callable from RLS policies and triggers (they run as the function owner).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_has_course_access(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_user_first_name() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
