-- Create community_topics table
CREATE TABLE public.community_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_replies table
CREATE TABLE public.community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.community_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.community_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_topics
CREATE POLICY "Users with course access can view topics"
ON public.community_topics
FOR SELECT
TO authenticated
USING (user_has_course_access(auth.uid()));

CREATE POLICY "Users with course access can create topics"
ON public.community_topics
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND user_has_course_access(auth.uid()));

CREATE POLICY "Users can update own topics"
ON public.community_topics
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own topics"
ON public.community_topics
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any topic"
ON public.community_topics
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for community_replies
CREATE POLICY "Users with course access can view replies"
ON public.community_replies
FOR SELECT
TO authenticated
USING (user_has_course_access(auth.uid()));

CREATE POLICY "Users with course access can create replies"
ON public.community_replies
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND user_has_course_access(auth.uid()));

CREATE POLICY "Users can update own replies"
ON public.community_replies
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies"
ON public.community_replies
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any reply"
ON public.community_replies
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on community_topics
CREATE TRIGGER update_community_topics_updated_at
BEFORE UPDATE ON public.community_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();