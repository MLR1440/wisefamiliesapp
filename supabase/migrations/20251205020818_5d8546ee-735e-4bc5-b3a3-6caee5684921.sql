-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles: users can view their own roles, admins can manage all
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop all temporary policies
DROP POLICY IF EXISTS "Temp: Allow all conversation operations" ON public.conversations;
DROP POLICY IF EXISTS "Temp: Allow all message operations" ON public.messages;
DROP POLICY IF EXISTS "Temp: Allow all progress operations" ON public.user_progress;
DROP POLICY IF EXISTS "Temp: Allow all event operations" ON public.events;
DROP POLICY IF EXISTS "Temp: Allow all module operations" ON public.modules;
DROP POLICY IF EXISTS "Temp: Allow all prompt operations" ON public.module_prompts;

-- Fix conversations RLS: users can only access their own conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE TO authenticated
  USING (auth.uid()::text = user_id);

-- Fix messages RLS: users can access messages in their conversations
CREATE POLICY "Users can view messages in own conversations" ON public.messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = messages.conversation_id 
    AND user_id = auth.uid()::text
  ));

CREATE POLICY "Users can create messages in own conversations" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = messages.conversation_id 
    AND user_id = auth.uid()::text
  ));

CREATE POLICY "Users can delete messages in own conversations" ON public.messages
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = messages.conversation_id 
    AND user_id = auth.uid()::text
  ));

-- Fix user_progress RLS: users can only access their own progress
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own progress" ON public.user_progress
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = user_id);

-- Fix events RLS: users can only access their own events
CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own events" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Fix modules RLS: public can read published, admins can manage all
CREATE POLICY "Admins can manage all modules" ON public.modules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix module_prompts RLS: admins can manage
CREATE POLICY "Admins can manage all prompts" ON public.module_prompts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));