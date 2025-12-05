import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { sampleModules } from '@/data/sampleContent';
import { Users, Activity, Award, BookOpen, Settings, FileText, Monitor, Database, Loader2, TrendingUp, MessageSquare } from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalytics';
import { useModules } from '@/hooks/useModules';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsStats {
  totalStudents: number;
  activeToday: number;
  courseCompletions: number;
  completionRate: number;
  topPrompts: { label: string; count: number }[];
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { fetchStats } = useAnalyticsData();
  const { modules } = useModules();
  
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Admin';

  useEffect(() => {
    const loadStats = async () => {
      const data = await fetchStats();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, [fetchStats]);

  const handleLoadSampleContent = async () => {
    setSeeding(true);
    try {
      // Delete existing prompts first (due to foreign key)
      await supabase.from('module_prompts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // Delete existing modules
      await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert sample modules
      for (const mod of sampleModules) {
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .insert({
            title: mod.title,
            description: mod.description,
            order_number: mod.order_number,
            video_url: mod.video_url,
            video_type: mod.video_type,
            system_prompt: mod.system_prompt,
            status: mod.status,
          })
          .select()
          .single();

        if (moduleError) throw moduleError;

        // Insert prompts for this module
        if (moduleData && mod.prompts.length > 0) {
          const promptsToInsert = mod.prompts.map((p, idx) => ({
            module_id: moduleData.id,
            label: p.label,
            prompt_text: p.prompt_text,
            order_number: idx + 1,
          }));

          const { error: promptError } = await supabase
            .from('module_prompts')
            .insert(promptsToInsert);

          if (promptError) throw promptError;
        }
      }

      toast.success('Sample content loaded successfully!');
      setShowSeedDialog(false);
      // Refresh the page to show new content
      window.location.reload();
    } catch (error) {
      console.error('Error seeding content:', error);
      toast.error('Failed to load sample content');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn isAdmin={isAdmin} hasPurchased userName={userName} />

      <main className="container py-6 md:py-12">
        {/* Mobile notice */}
        <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 p-4 md:hidden">
          <div className="flex items-start gap-3">
            <Monitor className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">Best on desktop</p>
              <p className="text-xs text-muted-foreground mt-1">
                Some features like drag-and-drop work better on larger screens.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 font-heading text-2xl md:text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your course content and view analytics
            </p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowSeedDialog(true)}
          >
            <Database className="h-4 w-4" />
            Load Sample Content
          </Button>
        </div>

        {/* Stats grid */}
        <div className="mb-6 md:mb-8 grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Students</p>
                <p className="mt-1 text-2xl md:text-3xl font-bold text-foreground">
                  {loading ? '-' : stats?.totalStudents || 0}
                </p>
              </div>
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Active Today</p>
                <p className="mt-1 text-2xl md:text-3xl font-bold text-foreground">
                  {loading ? '-' : stats?.activeToday || 0}
                </p>
              </div>
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Activity className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Completions</p>
                <p className="mt-1 text-2xl md:text-3xl font-bold text-foreground">
                  {loading ? '-' : stats?.courseCompletions || 0}
                </p>
              </div>
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Award className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Completion Rate</p>
                <p className="mt-1 text-2xl md:text-3xl font-bold text-foreground">
                  {loading ? '-' : `${stats?.completionRate || 0}%`}
                </p>
              </div>
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-6 md:mb-8">
          <h2 className="mb-3 md:mb-4 font-heading text-lg md:text-xl font-semibold text-foreground">
            Quick Actions
          </h2>
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Link to="/admin/modules">
              <Button variant="outline" className="h-auto w-full flex-col gap-1 md:gap-2 p-4 md:p-6">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <span className="font-semibold text-sm md:text-base">Manage Modules</span>
                <span className="text-xs text-muted-foreground">{modules.length} modules</span>
              </Button>
            </Link>

            <Link to="/admin/prompts">
              <Button variant="outline" className="h-auto w-full flex-col gap-1 md:gap-2 p-4 md:p-6">
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                <span className="font-semibold text-sm md:text-base">Prompt Library</span>
                <span className="text-xs text-muted-foreground">Manage templates</span>
              </Button>
            </Link>

            <Link to="/admin/settings">
              <Button variant="outline" className="h-auto w-full flex-col gap-1 md:gap-2 p-4 md:p-6">
                <Settings className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                <span className="font-semibold text-sm md:text-base">Settings</span>
                <span className="text-xs text-muted-foreground">LLM & Site config</span>
              </Button>
            </Link>

            <Link to="/admin/modules/new">
              <Button variant="cta" className="h-auto w-full flex-col gap-1 md:gap-2 p-4 md:p-6">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
                <span className="font-semibold text-sm md:text-base">Add New Module</span>
                <span className="text-xs opacity-80">Create content</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Popular Prompts */}
        {stats && stats.topPrompts.length > 0 && (
          <div>
            <h2 className="mb-3 md:mb-4 font-heading text-lg md:text-xl font-semibold text-foreground">
              Popular Prompts
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="divide-y divide-border">
                {stats.topPrompts.map((prompt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 md:p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-secondary/10">
                        <MessageSquare className="h-4 w-4 text-secondary" />
                      </div>
                      <p className="font-medium text-foreground text-sm md:text-base truncate max-w-[200px] md:max-w-none">
                        {prompt.label}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground flex-shrink-0 ml-2">
                      {prompt.count} uses
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Seed Content Dialog */}
      <AlertDialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load Sample Content</AlertDialogTitle>
            <AlertDialogDescription>
              This will <strong>replace all existing modules and prompts</strong> with 5 sample modules 
              designed for the WiseFamilies course. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={seeding}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLoadSampleContent}
              disabled={seeding}
              className="gap-2"
            >
              {seeding && <Loader2 className="h-4 w-4 animate-spin" />}
              {seeding ? 'Loading...' : 'Load Sample Content'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
