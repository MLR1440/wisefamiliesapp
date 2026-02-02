import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CourseSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useCourseSettings = () => {
  // Use null to indicate "not yet loaded" - this prevents race conditions
  // where loading becomes false before settings are available
  const [settings, setSettings] = useState<CourseSetting[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derive loading from settings state - guarantees they're always in sync
  const loading = settings === null;

  const fetchSettings = useCallback(async () => {
    // Set to null to indicate loading (only on refetch, initial is already null)
    setSettings(null);
    const { data, error: fetchError } = await supabase
      .from('course_settings')
      .select('*')
      .order('key');

    if (fetchError) {
      setError(fetchError.message);
      setSettings([]); // Exit loading state even on error
    } else {
      setSettings(data ?? []);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = (key: string): string => {
    const settingsArray = settings ?? [];
    const setting = settingsArray.find(s => s.key === key);
    return setting?.value || '';
  };

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('course_settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) throw error;
    await fetchSettings();
  };

  return {
    settings: settings ?? [], // Return empty array for compatibility
    loading,
    error,
    getSetting,
    updateSetting,
    refetch: fetchSettings,
  };
};
