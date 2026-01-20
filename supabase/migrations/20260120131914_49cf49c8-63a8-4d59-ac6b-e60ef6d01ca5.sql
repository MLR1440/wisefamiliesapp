-- Add first_name column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS first_name text DEFAULT NULL;

-- Backfill existing users from auth metadata
UPDATE public.user_profiles up
SET first_name = (
  SELECT raw_user_meta_data->>'first_name' 
  FROM auth.users 
  WHERE id = up.user_id
)
WHERE up.first_name IS NULL;

-- Create trigger function to auto-populate first_name on new signups/updates
CREATE OR REPLACE FUNCTION public.sync_user_first_name()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET first_name = NEW.raw_user_meta_data->>'first_name'
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_first_name_sync
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_first_name();

-- Add RLS policy allowing community members to view other members' first names
CREATE POLICY "Community members can view first names"
ON public.user_profiles FOR SELECT
TO authenticated
USING (
  user_has_course_access(auth.uid()) AND 
  user_has_course_access(user_id)
);