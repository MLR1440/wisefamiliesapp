import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type DbModule = Tables<'modules'>;
export type DbModulePrompt = Tables<'module_prompts'>;

export const useModules = () => {
  const [modules, setModules] = useState<DbModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('order_number', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setModules(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const createModule = async (module: TablesInsert<'modules'>) => {
    const { data, error } = await supabase
      .from('modules')
      .insert(module)
      .select()
      .single();

    if (error) throw error;
    await fetchModules();
    return data;
  };

  const updateModule = async (id: string, updates: TablesUpdate<'modules'>) => {
    const { data, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchModules();
    return data;
  };

  const deleteModule = async (id: string) => {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchModules();
  };

  const reorderModules = async (reorderedModules: DbModule[]) => {
    const updates = reorderedModules.map((m, idx) => ({
      id: m.id,
      order_number: idx + 1,
    }));

    for (const update of updates) {
      await supabase
        .from('modules')
        .update({ order_number: update.order_number })
        .eq('id', update.id);
    }

    await fetchModules();
  };

  return {
    modules,
    loading,
    error,
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
  };
};

export const useModule = (moduleId: string | undefined) => {
  const [module, setModule] = useState<DbModule | null>(null);
  const [prompts, setPrompts] = useState<DbModulePrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId || moduleId === 'new') {
      setLoading(false);
      return;
    }

    const fetchModule = async () => {
      const [moduleRes, promptsRes] = await Promise.all([
        supabase.from('modules').select('*').eq('id', moduleId).maybeSingle(),
        supabase.from('module_prompts').select('*').eq('module_id', moduleId).order('order_number'),
      ]);

      if (moduleRes.data) setModule(moduleRes.data);
      if (promptsRes.data) setPrompts(promptsRes.data);
      setLoading(false);
    };

    fetchModule();
  }, [moduleId]);

  return { module, prompts, loading };
};

export const useModulePrompts = (moduleId: string) => {
  const getPromptCount = async () => {
    const { count } = await supabase
      .from('module_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', moduleId);
    return count || 0;
  };

  const savePrompts = async (prompts: { label: string; promptText: string }[]) => {
    // Delete existing prompts
    await supabase.from('module_prompts').delete().eq('module_id', moduleId);

    // Insert new prompts
    const inserts = prompts.map((p, idx) => ({
      module_id: moduleId,
      label: p.label,
      prompt_text: p.promptText,
      order_number: idx + 1,
    }));

    if (inserts.length > 0) {
      const { error } = await supabase.from('module_prompts').insert(inserts);
      if (error) throw error;
    }
  };

  return { getPromptCount, savePrompts };
};
