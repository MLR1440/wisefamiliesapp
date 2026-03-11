import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  order_number: number;
  chapter_id: string | null;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  order_number: number;
}

interface Progress {
  module_id: string;
  started_at: string | null;
  completed_at: string | null;
  first_prompt_clicked: boolean | null;
}

const ProgressPage = () => {
  const { user, isAdmin, hasAccess } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.user_metadata?.first_name || 'User';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [modulesResult, chaptersResult, progressResult] = await Promise.all([
        supabase
          .from('modules')
          .select('id, title, description, order_number, chapter_id')
          .eq('status', 'published')
          .order('order_number', { ascending: true }),
        supabase
          .from('chapters')
          .select('id, title, description, order_number')
          .eq('status', 'published')
          .order('order_number', { ascending: true }),
        supabase
          .from('user_progress')
          .select('module_id, started_at, completed_at, first_prompt_clicked')
          .eq('user_id', user.id)
      ]);

      if (modulesResult.data) setModules(modulesResult.data);
      if (chaptersResult.data) setChapters(chaptersResult.data);
      if (progressResult.data) setProgress(progressResult.data);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getModuleStatus = (moduleId: string) => {
    const moduleProgress = progress.find((p) => p.module_id === moduleId);
    if (moduleProgress?.completed_at) return 'completed';
    if (moduleProgress?.started_at) return 'in-progress';
    return 'not-started';
  };

  const getModulesForChapter = (chapterId: string) => {
    return modules
      .filter((m) => m.chapter_id === chapterId)
      .sort((a, b) => a.order_number - b.order_number);
  };

  const unassignedModules = modules.filter((m) => !m.chapter_id);
  const completedCount = progress.filter((p) => p.completed_at).length;
  const inProgressCount = progress.filter((p) => p.started_at && !p.completed_at).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={!!user} isAdmin={isAdmin} hasPurchased={hasAccess} userName={firstName} />

      <main className="container max-w-3xl py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-1 font-heading text-2xl font-semibold text-foreground">
            Your Progress
          </h1>
          <p className="text-muted-foreground">
            Track your journey through the course
          </p>
        </div>

        {/* Simple stats */}
        <div className="mb-8 flex gap-6">
          <div>
            <span className="text-2xl font-semibold text-success">{completedCount}</span>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div>
            <span className="text-2xl font-semibold text-primary">{inProgressCount}</span>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
          <div>
            <span className="text-2xl font-semibold text-muted-foreground">
              {modules.length - completedCount - inProgressCount}
            </span>
            <p className="text-sm text-muted-foreground">Remaining</p>
          </div>
        </div>

        {/* Simple list */}
        <div className="space-y-6">
          {chapters.map((chapter) => {
            const chapterModules = getModulesForChapter(chapter.id);
            if (chapterModules.length === 0) return null;

            return (
              <div key={chapter.id}>
                <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                  {chapter.title}
                </h2>
                <div className="space-y-1">
                  {chapterModules.map((module) => {
                    const status = getModuleStatus(module.id);
                    const moduleProgress = progress.find((p) => p.module_id === module.id);

                    return (
                      <Link
                        key={module.id}
                        to={`/course/${module.id}`}
                        className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        {status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                        ) : (
                          <Circle className={`h-5 w-5 flex-shrink-0 ${status === 'in-progress' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{module.title}</p>
                          {moduleProgress?.completed_at && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(moduleProgress.completed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {unassignedModules.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Additional Modules
              </h2>
              <div className="space-y-1">
                {unassignedModules.map((module) => {
                  const status = getModuleStatus(module.id);

                  return (
                    <Link
                      key={module.id}
                      to={`/course/${module.id}`}
                      className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      ) : (
                        <Circle className={`h-5 w-5 flex-shrink-0 ${status === 'in-progress' ? 'text-primary' : 'text-muted-foreground/50'}`} />
                      )}
                      <p className="font-medium text-foreground">{module.title}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProgressPage;
