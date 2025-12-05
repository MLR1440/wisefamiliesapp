import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type DbChapter = Tables<'chapters'>;

export const useChapters = () => {
  const [chapters, setChapters] = useState<DbChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .order('order_number', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setChapters(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const createChapter = async (chapter: TablesInsert<'chapters'>) => {
    const { data, error } = await supabase
      .from('chapters')
      .insert(chapter)
      .select()
      .single();

    if (error) throw error;
    await fetchChapters();
    return data;
  };

  const updateChapter = async (id: string, updates: TablesUpdate<'chapters'>) => {
    const { data, error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchChapters();
    return data;
  };

  const deleteChapter = async (id: string) => {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchChapters();
  };

  const reorderChapters = async (reorderedChapters: DbChapter[]) => {
    const updates = reorderedChapters.map((c, idx) => ({
      id: c.id,
      order_number: idx + 1,
    }));

    for (const update of updates) {
      await supabase
        .from('chapters')
        .update({ order_number: update.order_number })
        .eq('id', update.id);
    }

    await fetchChapters();
  };

  return {
    chapters,
    loading,
    error,
    fetchChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
  };
};

export const useChapter = (chapterId: string | undefined) => {
  const [chapter, setChapter] = useState<DbChapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterId || chapterId === 'new') {
      setLoading(false);
      return;
    }

    const fetchChapter = async () => {
      const { data } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .maybeSingle();

      if (data) setChapter(data);
      setLoading(false);
    };

    fetchChapter();
  }, [chapterId]);

  return { chapter, loading };
};
