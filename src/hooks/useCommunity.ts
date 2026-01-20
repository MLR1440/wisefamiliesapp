import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CommunityTopic {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  reply_count?: number;
}

export interface CommunityReply {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

export const COMMUNITY_CATEGORIES = [
  { value: 'all', label: 'All Discussions' },
  { value: 'ai-tools', label: 'AI Tools' },
  { value: 'ai-safety', label: 'AI Safety' },
  { value: 'parenting-tips', label: 'Parenting Tips' },
  { value: 'course-discussion', label: 'Course Discussion' },
  { value: 'general', label: 'General' },
] as const;

export function useTopics(category?: string) {
  return useQuery({
    queryKey: ['community-topics', category],
    queryFn: async () => {
      let query = supabase
        .from('community_topics')
        .select('*')
        .order('updated_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get reply counts and author names
      const topicsWithDetails = await Promise.all(
        (data || []).map(async (topic) => {
          const [repliesRes, profileRes] = await Promise.all([
            supabase
              .from('community_replies')
              .select('id', { count: 'exact', head: true })
              .eq('topic_id', topic.id),
            supabase
              .from('user_profiles')
              .select('id')
              .eq('user_id', topic.user_id)
              .single()
          ]);

          // Get first name from auth metadata via edge or just show "Member"
          return {
            ...topic,
            reply_count: repliesRes.count || 0,
            author_name: 'Member', // We'll enhance this later if needed
          };
        })
      );

      return topicsWithDetails as CommunityTopic[];
    },
  });
}

export function useTopic(topicId: string) {
  return useQuery({
    queryKey: ['community-topic', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_topics')
        .select('*')
        .eq('id', topicId)
        .single();

      if (error) throw error;
      return data as CommunityTopic;
    },
    enabled: !!topicId,
  });
}

export function useReplies(topicId: string) {
  return useQuery({
    queryKey: ['community-replies', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_replies')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as CommunityReply[];
    },
    enabled: !!topicId,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ title, content, category }: { title: string; content: string; category: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('community_topics')
        .insert({
          user_id: user.id,
          title,
          content,
          category,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Discussion created');
    },
    onError: (error) => {
      toast.error('Failed to create discussion');
      console.error('Create topic error:', error);
    },
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ topicId, content }: { topicId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('community_replies')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update topic's updated_at
      await supabase
        .from('community_topics')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', topicId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community-replies', variables.topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Reply posted');
    },
    onError: (error) => {
      toast.error('Failed to post reply');
      console.error('Create reply error:', error);
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from('community_topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Discussion deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete discussion');
      console.error('Delete topic error:', error);
    },
  });
}

export function useDeleteReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ replyId, topicId }: { replyId: string; topicId: string }) => {
      const { error } = await supabase
        .from('community_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;
      return { topicId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-replies', data.topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Reply deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete reply');
      console.error('Delete reply error:', error);
    },
  });
}
