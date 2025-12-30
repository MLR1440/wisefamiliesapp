-- Standardize user_id columns to UUID to avoid type-cast based RLS and potential bypasses

-- Drop dependent policies first
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages in own conversations" ON public.messages;

DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;

DROP POLICY IF EXISTS "Users can view own events" ON public.events;
DROP POLICY IF EXISTS "Users can create own events" ON public.events;
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;

-- Convert user_id columns from TEXT -> UUID
ALTER TABLE public.conversations
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.user_progress
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.events
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Recreate RLS policies without ::text casts

-- conversations
CREATE POLICY "Users can view own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = user_id);

-- user_progress
CREATE POLICY "Users can view own progress"
ON public.user_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress"
ON public.user_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.user_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- events
CREATE POLICY "Users can view own events"
ON public.events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events"
ON public.events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all events"
ON public.events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- messages (authorize via the owning conversation)
CREATE POLICY "Users can view messages in own conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in own conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages in own conversations"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
  )
);
