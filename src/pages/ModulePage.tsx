import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, BookOpen, Trophy, PartyPopper } from 'lucide-react';
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
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, hasAccess, checkingPayment } = useAuth();
  const { module, prompts, loading } = useModule(moduleId);
  const [modules, setModules] = useState<ModuleWithChapter[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [clickedPromptIds, setClickedPromptIds] = useState<Set<string>>(new Set());
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [completedChapterTitle, setCompletedChapterTitle] = useState('');
  const { trackModuleStarted, trackModuleCompleted, trackVideoPlayed, trackCourseCompleted } = useAnalytics();
  const moduleStartTime = useRef<number>(Date.now());
  const hasTrackedStart = useRef(false);
  
  const userId = user?.id || '';
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';
  
  const { isCompleted, hasStarted, markStarted, markCompleted } = useProgress(userId, moduleId || '');
  
  // Reset interaction state when module changes
  useEffect(() => {
    setClickedPromptIds(new Set());
    setHasWatchedVideo(false);
    setShowFullDescription(false);
    setShowChapterComplete(false);
    setCompletedChapterTitle('');
  }, [moduleId]);
  
  // Has the user interacted with THIS module in any way?
  const hasInteracted = clickedPromptIds.size > 0 || hasStarted || hasWatchedVideo;

  // Fetch all modules and chapters for navigation
  useEffect(() => {
    const fetchModulesAndChapters = async () => {
      const [modulesRes, chaptersRes] = await Promise.all([
        supabase
          .from('modules')
          .select('id, title, description, order_number, chapter_id')
          .eq('status', 'published')
          .order('order_number'),
        supabase
          .from('chapters')
          .select('id, title, order_number')
          .eq('status', 'published')
          .order('order_number')
      ]);
      
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

  const moduleIndex = modules.findIndex((m) => m.id === moduleId);
  const currentModule = modules[moduleIndex];
  const nextModule = modules[moduleIndex + 1];
  const prevModule = modules[moduleIndex - 1];
  
  // Get current chapter info
  const currentChapter = currentModule?.chapter_id 
    ? chapters.find(c => c.id === currentModule.chapter_id) 
    : null;
  
  // Get modules in current chapter
  const modulesInChapter = currentChapter 
    ? modules.filter(m => m.chapter_id === currentChapter.id)
    : [];
  const moduleIndexInChapter = modulesInChapter.findIndex(m => m.id === moduleId);
  
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
        // Navigate to completion page
        setTimeout(() => {
          navigate('/course-complete');
        }, 1500);
        toast({
          title: "🎉 Course Completed!",
          description: "Congratulations! You've finished the entire course!",
        });
        return;
      }
      
      // Check if this is the last module in a chapter
      if (isLastModuleInChapter && currentChapter) {
        setCompletedChapterTitle(currentChapter.title);
        setShowChapterComplete(true);
        toast({
          title: `Chapter Complete! 🎉`,
          description: `You've finished "${currentChapter.title}"!`,
        });
        return;
      }
      
      toast({
        title: "Module completed! 🎉",
        description: "Great progress! Keep up the good work.",
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
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
        <main className="container py-6 md:py-12">
          <Skeleton className="mb-6 h-4 w-32" />
          <div className="mb-8">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-3 h-10 w-3/4 md:w-1/2" />
            <Skeleton className="h-6 w-full max-w-2xl" />
          </div>
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6 md:space-y-8">
              <VideoSkeleton />
              <ChatSkeleton />
            </div>
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Don't render if no access (will redirect)
  if (!hasAccess) {
    return null;
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
        <main className="container py-8 md:py-12">
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">Module not found</p>
            <Link to="/dashboard">
              <Button variant="soft">Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />

      <main className="container py-6 md:py-12">
        {/* Back navigation */}
        <Link
          to="/dashboard"
          className="mb-4 md:mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Chapter Complete Celebration */}
        {showChapterComplete && (
          <div className="mb-6 rounded-xl border border-success/50 bg-success/5 p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                <Trophy className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-success">
                  Chapter Complete! 🎉
                </h3>
                <p className="text-sm text-success/80">
                  You've finished "{completedChapterTitle}" — great work!
                </p>
              </div>
              <PartyPopper className="h-8 w-8 text-success animate-bounce hidden sm:block" />
            </div>
          </div>
        )}

        {/* Chapter indicator */}
        {currentChapter && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {currentChapter.title}
            </span>
            {modulesInChapter.length > 0 && (
              <span className="text-xs text-primary/70">
                • Lesson {moduleIndexInChapter + 1} of {modulesInChapter.length}
              </span>
            )}
          </div>
        )}

        {/* Module header */}
        <div className="mb-6 md:mb-8">
          {modules.length > 0 && (
            <span className="mb-2 inline-block text-sm font-medium text-secondary">
              Module {moduleIndex + 1} of {modules.length}
            </span>
          )}
          <h1 className="mb-2 md:mb-3 font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            {module.title}
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-muted-foreground">{module.description}</p>
        </div>

        {/* Mobile: stack everything, Desktop: two columns */}
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-5">
          {/* Main content - Video & Chat */}
          <div className="lg:col-span-3 space-y-6 md:space-y-8">
            {/* Video Section */}
            <VideoPlayer
              videoUrl={module.video_url}
              videoType={module.video_type}
              title={module.title}
              onPlay={handleVideoPlay}
            />

            {/* Chat Section - key forces remount on module change */}
            <ChatInterface
              key={module.id}
              moduleId={module.id}
              userId={userId}
              starterPrompts={prompts.map(p => ({
                id: p.id,
                label: p.label,
                prompt_text: p.prompt_text,
              }))}
              onFirstInteraction={handleFirstInteraction}
              onPromptClicked={handlePromptClicked}
              clickedPromptIds={clickedPromptIds}
              onResetPrompts={handleResetPrompts}
            />
          </div>

          {/* Sidebar - Navigation (mobile: appears below chat) */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Course complete indicator for last module */}
            {isLastModuleInCourse && (
              <div className="rounded-xl border border-secondary/50 bg-gradient-cta p-4 md:p-6 text-center">
                <Trophy className="h-8 w-8 text-secondary-foreground mx-auto mb-2" />
                <h3 className="font-heading font-semibold text-secondary-foreground">
                  Final Module!
                </h3>
                <p className="text-sm text-secondary-foreground/80 mt-1">
                  Complete this to finish the entire course
                </p>
                {isCompleted && hasInteracted && (
                  <Link to="/course-complete">
                    <Button variant="soft" className="mt-4 w-full gap-2">
                      View Completion Page
                      <Trophy className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Next module preview - tappable on mobile */}
            {nextModule && (
              <div className={`rounded-xl border bg-card p-4 md:p-6 ${
                isLastModuleInChapter ? 'border-success/30 ring-1 ring-success/20' : 'border-border'
              }`}>
                {/* New chapter indicator */}
                {isLastModuleInChapter && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-success/20">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-xs font-medium text-success">
                      Next: New Chapter
                    </span>
                  </div>
                )}
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Up Next
                </span>
                {/* Show the chapter of the next module */}
                {nextModule.chapter_id && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-primary">
                      {chapters.find(c => c.id === nextModule.chapter_id)?.title}
                    </span>
                  </div>
                )}
                <h3 className="mt-2 font-heading font-semibold text-foreground">
                  {nextModule.title}
                </h3>
                <p className={`mt-2 text-sm text-muted-foreground ${showFullDescription ? '' : 'line-clamp-2'}`}>
                  {nextModule.description}
                </p>
                {nextModule.description && nextModule.description.length > 100 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-1 text-xs text-secondary hover:text-secondary/80 font-medium transition-colors"
                  >
                    {showFullDescription ? 'Show less' : 'Read more'}
                  </button>
                )}
                {hasInteracted ? (
                  <Link to={`/course/${nextModule.id}`}>
                    <Button
                      variant="cta"
                      className="mt-4 w-full gap-2 h-11 md:h-10"
                    >
                      {isLastModuleInChapter ? 'Start Next Chapter' : 'Continue to Next Module'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="soft"
                    className="mt-4 w-full gap-2 h-11 md:h-10 cursor-not-allowed"
                    disabled
                  >
                    {isLastModuleInChapter ? 'Start Next Chapter' : 'Continue to Next Module'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {!hasInteracted && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Watch the video or interact with the chat to continue
                  </p>
                )}
              </div>
            )}

            {/* Previous module */}
            {prevModule && (
              <Link to={`/course/${prevModule.id}`}>
                <Button variant="ghost" className="w-full gap-2 h-11 md:h-10">
                  <ArrowLeft className="h-4 w-4" />
                  Go to Previous Module
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mark as complete - at the bottom */}
        <div className={`mt-8 rounded-xl border bg-card p-4 md:p-6 transition-all duration-300 ${
          isCompleted 
            ? 'border-green-500/50 bg-green-500/5' 
            : hasInteracted 
              ? 'border-secondary/50 ring-2 ring-secondary/20 shadow-sm' 
              : 'border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Checkbox
                  id="complete"
                  checked={isCompleted}
                  onCheckedChange={handleComplete}
                  disabled={!hasInteracted && !isCompleted}
                />
              )}
              <label
                htmlFor="complete"
                className={`text-sm font-medium cursor-pointer ${
                  isCompleted 
                    ? 'text-green-600 dark:text-green-400' 
                    : !hasInteracted 
                      ? 'text-muted-foreground' 
                      : 'text-foreground'
                }`}
              >
                {isCompleted ? 'Module completed!' : 'Mark as completed'}
              </label>
            </div>
            {!hasInteracted && !isCompleted && (
              <span className="text-xs text-muted-foreground">
                Interact with the module to enable
              </span>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ModulePage;
