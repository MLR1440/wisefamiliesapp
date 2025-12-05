import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

type EventType = 
  | 'module_started'
  | 'module_completed'
  | 'prompt_clicked'
  | 'message_sent'
  | 'video_played'
  | 'course_completed';

interface EventData {
  module_id?: string;
  prompt_label?: string;
  message_length?: number;
  time_spent_seconds?: number;
  [key: string]: unknown;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = useCallback(async (eventType: EventType, eventData?: EventData) => {
    if (!user?.id) return;
    
    try {
      
      await supabase.from('events').insert([{
        user_id: user.id,
        event_type: eventType,
        event_data: (eventData || {}) as Json,
      }]);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  const trackModuleStarted = useCallback((moduleId: string) => {
    return trackEvent('module_started', { module_id: moduleId });
  }, [trackEvent]);

  const trackModuleCompleted = useCallback((moduleId: string, timeSpentSeconds: number) => {
    return trackEvent('module_completed', { module_id: moduleId, time_spent_seconds: timeSpentSeconds });
  }, [trackEvent]);

  const trackPromptClicked = useCallback((moduleId: string, promptLabel: string) => {
    return trackEvent('prompt_clicked', { module_id: moduleId, prompt_label: promptLabel });
  }, [trackEvent]);

  const trackMessageSent = useCallback((moduleId: string, messageLength: number) => {
    return trackEvent('message_sent', { module_id: moduleId, message_length: messageLength });
  }, [trackEvent]);

  const trackVideoPlayed = useCallback((moduleId: string) => {
    return trackEvent('video_played', { module_id: moduleId });
  }, [trackEvent]);

  const trackCourseCompleted = useCallback(() => {
    return trackEvent('course_completed', {});
  }, [trackEvent]);

  return {
    trackEvent,
    trackModuleStarted,
    trackModuleCompleted,
    trackPromptClicked,
    trackMessageSent,
    trackVideoPlayed,
    trackCourseCompleted,
  };
};

interface EventRecord {
  user_id: string;
  event_type: string;
  event_data: Json;
  created_at: string;
}

// Hook for fetching analytics data (admin)
export const useAnalyticsData = () => {
  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique users
    const { data: allEvents } = await supabase
      .from('events')
      .select('user_id, event_type, event_data, created_at');

    if (!allEvents) return null;

    const events = allEvents as EventRecord[];
    const uniqueUsers = new Set(events.map(e => e.user_id));
    const todayEvents = events.filter(e => new Date(e.created_at) >= today);
    const activeToday = new Set(todayEvents.map(e => e.user_id));
    
    const courseCompletions = events.filter(e => e.event_type === 'course_completed').length;
    const moduleCompletions = events.filter(e => e.event_type === 'module_completed').length;
    const moduleStarts = events.filter(e => e.event_type === 'module_started').length;

    // Popular modules
    const moduleEvents = events.filter(e => {
      const data = e.event_data as Record<string, unknown> | null;
      return data && typeof data === 'object' && 'module_id' in data;
    });
    const moduleEngagement: Record<string, number> = {};
    moduleEvents.forEach(e => {
      const data = e.event_data as Record<string, unknown>;
      const moduleId = data.module_id as string;
      moduleEngagement[moduleId] = (moduleEngagement[moduleId] || 0) + 1;
    });

    // Common prompts
    const promptEvents = events.filter(e => e.event_type === 'prompt_clicked');
    const promptCounts: Record<string, number> = {};
    promptEvents.forEach(e => {
      const data = e.event_data as Record<string, unknown> | null;
      if (data && typeof data === 'object' && 'prompt_label' in data) {
        const label = data.prompt_label as string;
        promptCounts[label] = (promptCounts[label] || 0) + 1;
      }
    });

    const topPrompts = Object.entries(promptCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));

    return {
      totalStudents: uniqueUsers.size,
      activeToday: activeToday.size,
      courseCompletions,
      completionRate: moduleStarts > 0 ? Math.round((moduleCompletions / moduleStarts) * 100) : 0,
      moduleEngagement,
      topPrompts,
    };
  };

  return { fetchStats };
};
