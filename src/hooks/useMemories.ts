import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Memory {
  id: string;
  memory_key: string;
  memory_value: string;
  created_at: string;
  updated_at: string;
}

export const useMemories = (userId: string | undefined) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMemories = useCallback(async () => {
    if (!userId) {
      setMemories([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_memories')
        .select('id, memory_key, memory_value, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (err) {
      console.error('Error fetching memories:', err);
      setMemories([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const deleteMemory = async (memoryId: string) => {
    try {
      const { error } = await supabase
        .from('user_memories')
        .delete()
        .eq('id', memoryId);

      if (error) throw error;
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      return true;
    } catch (err) {
      console.error('Error deleting memory:', err);
      return false;
    }
  };

  const clearAllMemories = async () => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('user_memories')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      setMemories([]);
      return true;
    } catch (err) {
      console.error('Error clearing memories:', err);
      return false;
    }
  };

  return {
    memories,
    isLoading,
    deleteMemory,
    clearAllMemories,
    refetch: fetchMemories,
  };
};

// Helper to format memory keys for display
export const formatMemoryKey = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
