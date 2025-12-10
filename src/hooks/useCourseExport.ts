import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExportData {
  exportedAt: string;
  chapters: any[];
  modules: any[];
  modulePrompts: any[];
  courseSettings: any[];
}

export const useCourseExport = () => {
  const [exporting, setExporting] = useState(false);

  const exportCourse = async () => {
    setExporting(true);
    try {
      // Fetch all data in parallel
      const [chaptersRes, modulesRes, promptsRes, settingsRes] = await Promise.all([
        supabase.from('chapters').select('*').order('order_number'),
        supabase.from('modules').select('*').order('order_number'),
        supabase.from('module_prompts').select('*').order('order_number'),
        supabase.from('course_settings').select('*'),
      ]);

      if (chaptersRes.error) throw chaptersRes.error;
      if (modulesRes.error) throw modulesRes.error;
      if (promptsRes.error) throw promptsRes.error;
      if (settingsRes.error) throw settingsRes.error;

      const exportData: ExportData = {
        exportedAt: new Date().toISOString(),
        chapters: chaptersRes.data || [],
        modules: modulesRes.data || [],
        modulePrompts: promptsRes.data || [],
        courseSettings: settingsRes.data || [],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `wisefamilies-course-export-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setExporting(false);
    }
  };

  return { exportCourse, exporting };
};
