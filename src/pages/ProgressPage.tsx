import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Circle, Play, Loader2 } from 'lucide-react';

interface Module {
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
  const { user, isAdmin, hasPurchased } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.user_metadata?.first_name || 'User';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch modules and progress in parallel
      const [modulesResult, progressResult] = await Promise.all([
        supabase
          .from('modules')
          .select('id, title, description, order_number')
          .eq('status', 'published')
          .order('order_number', { ascending: true }),
        supabase
          .from('user_progress')
          .select('module_id, started_at, completed_at, first_prompt_clicked')
          .eq('user_id', user.id)
      ]);

      if (modulesResult.data) setModules(modulesResult.data);
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

  const completedCount = progress.filter((p) => p.completed_at).length;
  const inProgressCount = progress.filter((p) => p.started_at && !p.completed_at).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={!!user} isAdmin={isAdmin} hasPurchased={hasPurchased} userName={firstName} />

      <main className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
            Your Progress
          </h1>
          <p className="text-muted-foreground">
            Track your journey through the AI-Ready Parenting Framework
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="text-3xl font-bold text-primary">{completedCount}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="text-3xl font-bold text-secondary">{inProgressCount}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="text-3xl font-bold text-muted-foreground">
              {modules.length - completedCount - inProgressCount}
            </div>
            <div className="text-sm text-muted-foreground">Not Started</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-8">
            {modules.map((module, index) => {
              const status = getModuleStatus(module.id);
              const moduleProgress = progress.find((p) => p.module_id === module.id);
              const isEven = index % 2 === 0;

              return (
                <div
                  key={module.id}
                  className={`relative flex items-start gap-4 md:gap-8 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 -translate-x-1/2 md:left-1/2">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-background ${
                        status === 'completed'
                          ? 'bg-success text-success-foreground'
                          : status === 'in-progress'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : status === 'in-progress' ? (
                        <Play className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {/* Content card */}
                  <div className={`ml-16 flex-1 md:ml-0 md:w-[calc(50%-3rem)] ${isEven ? '' : 'md:text-right'}`}>
                    <Link
                      to={`/course/${module.id}`}
                      className="block rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-soft"
                    >
                      <span className="text-sm font-medium text-muted-foreground">
                        Module {index + 1}
                      </span>
                      <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">
                        {module.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {module.description}
                      </p>

                      {/* Status badge */}
                      <div className={`mt-4 ${isEven ? '' : 'md:flex md:justify-end'}`}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            status === 'completed'
                              ? 'bg-primary/10 text-primary'
                              : status === 'in-progress'
                              ? 'bg-secondary/10 text-secondary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                          {status === 'in-progress' && <Play className="h-3 w-3" />}
                          {status === 'completed'
                            ? 'Completed'
                            : status === 'in-progress'
                            ? 'In Progress'
                            : 'Not Started'}
                        </span>
                      </div>

                      {/* Completion date */}
                      {moduleProgress?.completed_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Completed on {new Date(moduleProgress.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </Link>
                  </div>

                  {/* Spacer for alignment */}
                  <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProgressPage;
