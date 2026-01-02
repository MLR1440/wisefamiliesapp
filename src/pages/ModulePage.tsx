import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import VideoPlayer from '@/components/module/VideoPlayer';
import ChatInterface from '@/components/module/ChatInterface';
import { useModule } from '@/hooks/useModules';
import { useProgress } from '@/hooks/useProgress';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { VideoSkeleton, ChatSkeleton, Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
interface ModuleWithChapter {
  id: string;
  title: string;
  description: string;
  order_number: number;
  chapter_id: string | null;
}
interface Chapter {
  id: string;
  title: string;
  order_number: number;
}
const ModulePage = () => {
  const {
    moduleId
  } = useParams();
  const navigate = useNavigate();
  const {
    user,
    isAdmin,
    hasAccess,
    checkingPayment
  } = useAuth();
  const {
    module,
    prompts,
    loading
  } = useModule(moduleId);
  const [modules, setModules] = useState<ModuleWithChapter[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [clickedPromptIds, setClickedPromptIds] = useState<Set<string>>(new Set());
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const {
    trackModuleStarted,
    trackModuleCompleted,
    trackVideoPlayed,
    trackCourseCompleted
  } = useAnalytics();
  const moduleStartTime = useRef<number>(Date.now());
  const hasTrackedStart = useRef(false);
  const userId = user?.id || '';
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';
  const {
    isCompleted,
    hasStarted,
    markStarted,
    markCompleted
  } = useProgress(userId, moduleId || '');

  // Reset interaction state when module changes
  useEffect(() => {
    setClickedPromptIds(new Set());
    setHasWatchedVideo(false);
  }, [moduleId]);

  // Has the user interacted with THIS module in any way?
  const hasInteracted = clickedPromptIds.size > 0 || hasStarted || hasWatchedVideo;

  // Fetch all modules and chapters for navigation
  useEffect(() => {
    const fetchModulesAndChapters = async () => {
      const [modulesRes, chaptersRes] = await Promise.all([supabase.from('modules').select('id, title, description, order_number, chapter_id').eq('status', 'published').order('order_number'), supabase.from('chapters').select('id, title, order_number').eq('status', 'published').order('order_number')]);
      if (modulesRes.data) setModules(modulesRes.data);
      if (chaptersRes.data) setChapters(chaptersRes.data);
    };
    fetchModulesAndChapters();
  }, []);

  // Track module start
  useEffect(() => {
    if (moduleId && !hasTrackedStart.current) {
      hasTrackedStart.current = true;
      moduleStartTime.current = Date.now();
      trackModuleStarted(moduleId);
    }
    return () => {
      hasTrackedStart.current = false;
    };
  }, [moduleId, trackModuleStarted]);
  const moduleIndex = modules.findIndex(m => m.id === moduleId);
  const currentModule = modules[moduleIndex];
  const nextModule = modules[moduleIndex + 1];
  const prevModule = modules[moduleIndex - 1];

  // Get current chapter info
  const currentChapter = currentModule?.chapter_id ? chapters.find(c => c.id === currentModule.chapter_id) : null;

  // Check if next module is in a different chapter (chapter transition)
  const isLastModuleInChapter = nextModule && currentModule?.chapter_id !== nextModule.chapter_id;
  const isLastModuleInCourse = moduleIndex === modules.length - 1;
  const handleFirstInteraction = () => {
    markStarted();
  };
  const handlePromptClicked = (promptId: string) => {
    setClickedPromptIds(prev => new Set([...prev, promptId]));
  };
  const handleResetPrompts = () => {
    setClickedPromptIds(new Set());
  };
  const handleComplete = async (checked: boolean) => {
    if (checked && moduleId) {
      await markCompleted();
      const timeSpent = Math.round((Date.now() - moduleStartTime.current) / 1000);
      trackModuleCompleted(moduleId, timeSpent);

      // Check if this is the last module in course
      if (isLastModuleInCourse) {
        trackCourseCompleted();
        setTimeout(() => {
          navigate('/course-complete');
        }, 1500);
        toast({
          title: "Course Completed!",
          description: "Congratulations! You've finished the entire course."
        });
        return;
      }

      // Check if this is the last module in a chapter
      if (isLastModuleInChapter && currentChapter) {
        toast({
          title: `Chapter Complete`,
          description: `You've finished "${currentChapter.title}"`
        });
        return;
      }
      toast({
        title: "Module completed",
        description: "Great progress. Keep going!"
      });
    }
  };
  const handleVideoPlay = () => {
    setHasWatchedVideo(true);
    if (moduleId) {
      trackVideoPlayed(moduleId);
    }
  };

  // Redirect if user doesn't have access
  useEffect(() => {
    if (!checkingPayment && !hasAccess) {
      navigate('/dashboard');
    }
  }, [checkingPayment, hasAccess, navigate]);

  // Loading state with skeletons
  if (loading || checkingPayment) {
    return <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
        <main className="container max-w-6xl py-8 md:py-12">
          <Skeleton className="mb-8 h-4 w-24" />
          <div className="mb-10">
            <Skeleton className="mb-3 h-8 w-2/3" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </div>
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-8">
              <VideoSkeleton />
              <ChatSkeleton />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40 rounded-xl" />
            </div>
          </div>
        </main>
      </div>;
  }

  // Don't render if no access (will redirect)
  if (!hasAccess) {
    return null;
  }
  if (!module) {
    return <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
        <main className="container max-w-6xl py-12">
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">Module not found</p>
            <Link to="/dashboard">
              <Button variant="soft">Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>;
  }
  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />

      <main className="container max-w-5xl py-6 md:py-10">
        {/* Header with back navigation and module info */}
        <header className="mb-8">
          <Link 
            to="/dashboard" 
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Dashboard
          </Link>

          <div className="space-y-3">
            {currentChapter && (
              <div className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-sm font-medium text-primary">
                  {currentChapter.title}
                </span>
              </div>
            )}
            <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {module.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {module.description}
            </p>
          </div>
        </header>

        {/* Full width video and chat */}
        <div className="space-y-8">
          <div className="overflow-hidden rounded-xl border border-border shadow-sm">
            <VideoPlayer 
              videoUrl={module.video_url} 
              videoType={module.video_type} 
              title={module.title} 
              onPlay={handleVideoPlay} 
            />
          </div>

          <ChatInterface 
            key={module.id} 
            moduleId={module.id} 
            userId={userId} 
            starterPrompts={prompts.map(p => ({
              id: p.id,
              label: p.label,
              prompt_text: p.prompt_text
            }))} 
            onFirstInteraction={handleFirstInteraction} 
            onPromptClicked={handlePromptClicked} 
            clickedPromptIds={clickedPromptIds} 
            onResetPrompts={handleResetPrompts} 
          />
        </div>

        {/* Bottom navigation section */}
        <footer className="mt-12 rounded-2xl border border-border bg-card/50 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Previous module */}
            <div className="order-2 md:order-1 md:flex-1">
              {prevModule ? (
                <Link to={`/course/${prevModule.id}`}>
                  <Button 
                    variant="ghost" 
                    className="w-full md:w-auto gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous:</span>
                    <span className="truncate max-w-[150px]">{prevModule.title}</span>
                  </Button>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* Mark as complete - center */}
            <div className="order-1 md:order-2 flex justify-center">
              <div 
                className={`
                  flex items-center gap-4 rounded-full px-6 py-3 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-success/10 border-2 border-success/30' 
                    : hasInteracted 
                      ? 'bg-primary/5 border-2 border-primary/20 hover:border-primary/40' 
                      : 'bg-muted/50 border-2 border-border'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Checkbox 
                    id="complete" 
                    checked={isCompleted} 
                    onCheckedChange={handleComplete} 
                    disabled={!hasInteracted && !isCompleted}
                    className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                  />
                )}
                <label 
                  htmlFor="complete" 
                  className={`
                    text-sm font-semibold cursor-pointer select-none
                    ${isCompleted 
                      ? 'text-success' 
                      : hasInteracted 
                        ? 'text-foreground' 
                        : 'text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted ? 'Module Complete!' : 'Mark as Complete'}
                </label>
                {!hasInteracted && !isCompleted && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    (watch or chat first)
                  </span>
                )}
              </div>
            </div>

            {/* Next module */}
            <div className="order-3 md:flex-1 flex justify-end">
              {nextModule ? (
                <div className="w-full md:w-auto flex flex-col items-end gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Up Next
                  </span>
                  {hasInteracted ? (
                    <Link to={`/course/${nextModule.id}`} className="w-full md:w-auto">
                      <Button variant="default" className="w-full md:w-auto gap-2 group">
                        <span className="truncate max-w-[150px]">{nextModule.title}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="w-full md:w-auto gap-2" disabled>
                      <span className="truncate max-w-[150px]">{nextModule.title}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : isLastModuleInCourse ? (
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-success">
                    Final Module
                  </span>
                  {isCompleted && (
                    <Link to="/course-complete">
                      <Button variant="default" className="gap-2">
                        View Completion
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div />
              )}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
export default ModulePage;