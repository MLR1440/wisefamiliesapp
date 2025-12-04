import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Progress {
  id: string;
  module_id: string;
  started_at: string | null;
  completed_at: string | null;
  first_prompt_clicked: boolean;
}

export const useProgress = (userId: string, moduleId: string) => {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      if (!userId || !moduleId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .maybeSingle();

      setProgress(data);
      setLoading(false);
    };

    loadProgress();
  }, [userId, moduleId]);

  const markStarted = useCallback(async () => {
    if (!userId || !moduleId) return;

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        module_id: moduleId,
        started_at: new Date().toISOString(),
        first_prompt_clicked: true,
      }, {
        onConflict: 'user_id,module_id',
      })
      .select()
      .single();

    if (!error && data) {
      setProgress(data);
    }
    return data;
  }, [userId, moduleId]);

  const markCompleted = useCallback(async () => {
    if (!userId || !moduleId) return;

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        module_id: moduleId,
        completed_at: new Date().toISOString(),
        first_prompt_clicked: true,
        started_at: progress?.started_at || new Date().toISOString(),
      }, {
        onConflict: 'user_id,module_id',
      })
      .select()
      .single();

    if (!error && data) {
      setProgress(data);
    }
    return data;
  }, [userId, moduleId, progress]);

  return {
    progress,
    loading,
    hasStarted: !!progress?.first_prompt_clicked,
    isCompleted: !!progress?.completed_at,
    markStarted,
    markCompleted,
  };
};

export const useOverallProgress = (userId: string) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Get total published modules
      const { count: total } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      // Get completed modules for user
      const { count: completed } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      setTotalCount(total || 0);
      setCompletedCount(completed || 0);
      setLoading(false);
    };

    loadProgress();
  }, [userId]);

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return { completedCount, totalCount, percentage, loading };
};
