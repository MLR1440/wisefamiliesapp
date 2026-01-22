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
  const [settings, setSettings] = useState<CourseSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('course_settings')
      .select('*')
      .order('key');

    if (error) {
      setError(error.message);
    } else {
      setSettings(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = (key: string): string => {
    const setting = settings.find(s => s.key === key);
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
    settings,
    loading,
    error,
    getSetting,
    updateSetting,
    refetch: fetchSettings,
  };
};
