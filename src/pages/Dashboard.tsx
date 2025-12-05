import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle2, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Paywall from '@/components/Paywall';

interface Module {
  id: string;
  title: string;
  description: string;
  order_number: number;
}

interface UserProgress {
  module_id: string;
  started_at: string | null;
  completed_at: string | null;
  first_prompt_clicked: boolean;
}

const Dashboard = () => {
  const { user, hasAccess, checkingPayment, isAdmin } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || '';
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Fetch published modules
      const { data: modulesData } = await supabase
        .from('modules')
        .select('id, title, description, order_number')
        .eq('status', 'published')
        .order('order_number');

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('module_id, started_at, completed_at, first_prompt_clicked')
        .eq('user_id', userId);

      setModules(modulesData || []);
      setProgress(progressData || []);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const completedModules = progress.filter((p) => p.completed_at).length;
  const totalModules = modules.length;
  const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  // Find the current module (first incomplete one)
  const getModuleStatus = (moduleId: string, moduleIndex: number) => {
    const moduleProgress = progress.find((p) => p.module_id === moduleId);
    if (moduleProgress?.completed_at) return 'completed';
    if (moduleProgress?.started_at || moduleProgress?.first_prompt_clicked) return 'current';
    
    // Check if previous module is completed (or if this is the first module)
    if (moduleIndex === 0) return 'current';
    
    const previousModule = modules[moduleIndex - 1];
    if (previousModule) {
      const previousProgress = progress.find((p) => p.module_id === previousModule.id);
      if (previousProgress?.completed_at) return 'current';
    }
    
    return 'locked';
  };

  // Find the current module to continue
  const currentModule = modules.find((module, index) => {
    const status = getModuleStatus(module.id, index);
    return status === 'current';
  }) || modules[0];

  if (loading || checkingPayment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} />
        <main className="container py-8 md:py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {checkingPayment && (
              <p className="text-sm text-muted-foreground">Verifying access...</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Show paywall if user doesn't have access (not admin and hasn't purchased)
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={false} userName={userName} />
        <main className="container py-8 md:py-12">
          <div className="mb-8">
            <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
              Welcome, {userName}!
            </h1>
            <p className="text-muted-foreground">
              Get started with the AI-Ready Parenting framework
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <Paywall />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Course Preview
              </h3>
              {modules.slice(0, 3).map((module, index) => (
                <div
                  key={module.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Module {index + 1}</p>
                    <h4 className="font-medium text-foreground">{module.title}</h4>
                  </div>
                </div>
              ))}
              {modules.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  + {modules.length - 3} more modules
                </p>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} />
      
      <main className="container py-8 md:py-12">
        {/* Welcome section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Welcome back, {userName}!
            </h1>
            {isAdmin && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Admin
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            Continue your AI-Ready Parenting journey
          </p>
        </div>

        {/* Progress card */}
        <div className="mb-8 rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h2 className="mb-2 font-heading text-lg font-semibold text-foreground">
                Course Progress
              </h2>
              <div className="mb-2 flex items-center gap-2">
                <Progress value={progressPercentage} className="h-3 flex-1" />
                <span className="text-sm font-medium text-muted-foreground">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {completedModules} of {totalModules} modules completed
              </p>
            </div>
            
            {currentModule && (
              <Link to={`/course/${currentModule.id}`}>
                <Button variant="cta" size="lg" className="gap-2">
                  Continue Learning
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Modules list */}
        <div>
          <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
            Your Modules
          </h2>
          
          {modules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <p className="text-muted-foreground">No modules available yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((module, index) => {
                const status = getModuleStatus(module.id, index);
                
                return (
                  <Link
                    key={module.id}
                    to={status !== 'locked' ? `/course/${module.id}` : '#'}
                    className={`group flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 ${
                      status === 'locked'
                        ? 'cursor-not-allowed border-border bg-muted/30'
                        : status === 'current'
                        ? 'border-primary/50 bg-primary/5 hover:border-primary hover:shadow-soft'
                        : 'border-border bg-card hover:border-primary/30 hover:shadow-soft'
                    }`}
                    onClick={(e) => status === 'locked' && e.preventDefault()}
                  >
                    {/* Status icon */}
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                        status === 'completed'
                          ? 'bg-primary text-primary-foreground'
                          : status === 'current'
                          ? 'bg-gradient-cta text-secondary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : status === 'locked' ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Module {index + 1}
                        </span>
                        {status === 'current' && (
                          <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-medium text-secondary">
                            {progress.find(p => p.module_id === module.id)?.started_at ? 'In Progress' : 'Start Here'}
                          </span>
                        )}
                      </div>
                      <h3 className={`font-heading font-semibold ${
                        status === 'locked' ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {module.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {module.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    {status !== 'locked' && (
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
