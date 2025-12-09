import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle2, Lock, ArrowRight, Loader2, ChevronDown, UserCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Paywall from '@/components/Paywall';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
interface UserProgress {
  module_id: string;
  started_at: string | null;
  completed_at: string | null;
  first_prompt_clicked: boolean;
}
const Dashboard = () => {
  const {
    user,
    hasAccess,
    checkingPayment,
    isAdmin
  } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set());
  const userId = user?.id || '';
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Fetch published chapters
      const {
        data: chaptersData
      } = await supabase.from('chapters').select('id, title, description, order_number').eq('status', 'published').order('order_number');

      // Fetch published modules
      const {
        data: modulesData
      } = await supabase.from('modules').select('id, title, description, order_number, chapter_id').eq('status', 'published').order('order_number');

      // Fetch user progress
      const {
        data: progressData
      } = await supabase.from('user_progress').select('module_id, started_at, completed_at, first_prompt_clicked').eq('user_id', userId);
      setChapters(chaptersData || []);
      setModules(modulesData || []);
      setProgress(progressData || []);

      // Open all chapters by default
      if (chaptersData) {
        setOpenChapters(new Set(chaptersData.map(c => c.id)));
      }
      setLoading(false);
    };
    fetchData();
  }, [userId]);
  const completedModules = progress.filter(p => p.completed_at).length;
  const totalModules = modules.length;
  const progressPercentage = totalModules > 0 ? completedModules / totalModules * 100 : 0;

  // Get modules for a specific chapter
  const getModulesForChapter = (chapterId: string) => {
    return modules.filter(m => m.chapter_id === chapterId).sort((a, b) => a.order_number - b.order_number);
  };

  // Get unassigned modules
  const unassignedModules = modules.filter(m => !m.chapter_id);

  // Build a flat list of all modules in order (for determining current/locked status)
  const allModulesInOrder = [...chapters.flatMap(chapter => getModulesForChapter(chapter.id)), ...unassignedModules];

  // Find the current module (first incomplete one)
  const getModuleStatus = (moduleId: string) => {
    const moduleProgress = progress.find(p => p.module_id === moduleId);
    if (moduleProgress?.completed_at) return 'completed';
    if (moduleProgress?.started_at || moduleProgress?.first_prompt_clicked) return 'current';

    // Check if previous module in the global order is completed (or if this is the first module)
    const moduleIndex = allModulesInOrder.findIndex(m => m.id === moduleId);
    if (moduleIndex === 0) return 'current';
    const previousModule = allModulesInOrder[moduleIndex - 1];
    if (previousModule) {
      const previousProgress = progress.find(p => p.module_id === previousModule.id);
      if (previousProgress?.completed_at) return 'current';
    }
    return 'locked';
  };

  // Find the current module to continue
  const currentModule = allModulesInOrder.find(module => {
    const status = getModuleStatus(module.id);
    return status === 'current';
  }) || allModulesInOrder[0];
  const toggleChapter = (chapterId: string) => {
    setOpenChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };
  const renderModuleItem = (module: Module, globalIndex: number) => {
    const status = getModuleStatus(module.id);
    return <Link key={module.id} to={status !== 'locked' ? `/course/${module.id}` : '#'} className={`group flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 ${status === 'locked' ? 'cursor-not-allowed border-border bg-muted/30' : status === 'current' ? 'border-primary/50 bg-primary/5 hover:border-primary hover:shadow-soft' : 'border-border bg-card hover:border-primary/30 hover:shadow-soft'}`} onClick={e => status === 'locked' && e.preventDefault()}>
        {/* Status icon */}
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${status === 'completed' ? 'bg-success text-success-foreground' : status === 'current' ? 'bg-gradient-cta text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : status === 'locked' ? <Lock className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {status === 'current' && <span className="rounded-full bg-secondary/20 px-2.5 py-1 text-sm font-medium text-secondary">
                {progress.find(p => p.module_id === module.id)?.started_at ? 'In Progress' : 'Start Here'}
              </span>}
          </div>
          <h3 className={`font-heading font-semibold text-base md:text-lg ${status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}>
            {module.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            {module.description}
          </p>
        </div>

        {/* Arrow */}
        {status !== 'locked' && <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />}
      </Link>;
  };
  if (loading || checkingPayment) {
    return <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} />
        <main className="container py-8 md:py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {checkingPayment && <p className="text-sm text-muted-foreground">Verifying access...</p>}
          </div>
        </main>
      </div>;
  }

  // Show paywall if user doesn't have access (not admin and hasn't purchased)
  if (!hasAccess) {
    return <div className="min-h-screen bg-background">
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
              {modules.slice(0, 3).map((module, index) => <div key={module.id} className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Module {index + 1}</p>
                    <h4 className="font-medium text-foreground">{module.title}</h4>
                  </div>
                </div>)}
              {modules.length > 3 && <p className="text-sm text-muted-foreground text-center">
                  + {modules.length - 3} more modules
                </p>}
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} />
      
      <main className="container py-6 md:py-12 px-4 md:px-8">
        {/* Welcome section */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                Welcome back, {userName}!
              </h1>
              {isAdmin && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Admin
                </span>}
            </div>
            <p className="text-base text-muted-foreground">
              Continue your AI-Ready Parenting journey
            </p>
          </div>
          <Link to="/profile">
            <Button variant="outline" size="sm" className="gap-2 h-10">
              <UserCog className="h-4 w-4" />
              <span>Customize Child Info</span>
            </Button>
          </Link>
        </div>

        {/* Progress card */}
        <div className="mb-6 md:mb-8 rounded-2xl border border-border bg-gradient-card p-5 md:p-6 shadow-soft">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h2 className="mb-2 font-heading text-lg md:text-xl font-semibold text-foreground">
                Course Progress
              </h2>
              <div className="mb-2 flex items-center gap-3">
                <Progress value={progressPercentage} className="h-3 flex-1" />
                <span className="text-base font-medium text-muted-foreground">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <p className="text-base text-muted-foreground">
                {completedModules} of {totalModules} modules completed
              </p>
            </div>
            
            {currentModule && <Link to={`/course/${currentModule.id}`}>
                <Button variant="cta" size="lg" className="gap-2 w-full md:w-auto h-12 text-base">
                  Continue Learning
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>}
          </div>
        </div>

        {/* Course content */}
        <div>
          <h2 className="mb-4 font-heading text-xl md:text-2xl font-semibold text-foreground">
            Course Content
          </h2>
          
          {allModulesInOrder.length === 0 ? <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <p className="text-muted-foreground">No content available yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
            </div> : <div className="space-y-4">
              {/* Chapters with modules */}
              {chapters.map(chapter => {
            const chapterModules = getModulesForChapter(chapter.id);
            if (chapterModules.length === 0) return null;
            const completedInChapter = chapterModules.filter(m => progress.find(p => p.module_id === m.id)?.completed_at).length;
            return <Collapsible key={chapter.id} open={openChapters.has(chapter.id)} onOpenChange={() => toggleChapter(chapter.id)}>
                    <div className="rounded-xl border border-border overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-3 w-full p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                          <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform ${openChapters.has(chapter.id) ? '' : '-rotate-90'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-heading font-semibold text-base md:text-lg text-foreground">
                                {chapter.title}
                              </h3>
                              <span className="text-sm text-muted-foreground flex-shrink-0">
                                {completedInChapter}/{chapterModules.length}
                              </span>
                            </div>
                            {chapter.description && (
                              <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                                {chapter.description}
                              </p>
                            )}
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 pt-2 space-y-3">
                          {chapterModules.map((module, index) => renderModuleItem(module, index))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>;
          })}

              {/* Unassigned modules */}
              {unassignedModules.length > 0 && chapters.length > 0 && <div className="space-y-3 mt-6">
                  <h3 className="font-heading text-sm font-medium text-muted-foreground">
                    Additional Modules
                  </h3>
                  {unassignedModules.map((module, index) => renderModuleItem(module, index))}
                </div>}

              {/* If no chapters, show modules directly */}
              {chapters.length === 0 && <div className="space-y-3">
                  {modules.map((module, index) => renderModuleItem(module, index))}
                </div>}
            </div>}
        </div>
      </main>

      <Footer />
    </div>;
};
export default Dashboard;