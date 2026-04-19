CREATE OR REPLACE FUNCTION public.user_has_course_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    public.has_role(_user_id, 'admin')
    OR EXISTS (
      SELECT 1 
      FROM public.user_purchases 
      WHERE user_id = _user_id
        AND refunded IS NOT TRUE
    )
$function$;