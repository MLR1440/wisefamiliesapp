import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Circle, Play, Loader2, BookOpen } from 'lucide-react';

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
  const { user, isAdmin, hasPurchased } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.user_metadata?.first_name || 'User';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch modules, chapters, and progress in parallel
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

  const renderModuleCard = (module: Module, index: number, isEven: boolean, globalIndex: number) => {
    const status = getModuleStatus(module.id);
    const moduleProgress = progress.find((p) => p.module_id === module.id);

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
              Module {globalIndex + 1}
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
                    ? 'bg-success/10 text-success'
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
  };

  const renderChapterHeader = (chapter: Chapter, chapterIndex: number) => {
    const chapterModules = getModulesForChapter(chapter.id);
    const completedInChapter = chapterModules.filter(
      (m) => progress.find((p) => p.module_id === m.id)?.completed_at
    ).length;

    return (
      <div key={`chapter-header-${chapter.id}`} className="relative py-6">
        {/* Chapter indicator line break */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/30 md:left-1/2 md:-translate-x-1/2" />
        
        {/* Chapter badge centered */}
        <div className="relative flex justify-center">
          <div className="flex items-center gap-3 rounded-full border-2 border-primary/30 bg-card px-5 py-3 shadow-soft">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="font-heading text-base font-semibold text-foreground">
                {chapter.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {completedInChapter}/{chapterModules.length} completed
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Build ordered content with chapter headers interspersed
  let globalModuleIndex = 0;
  const timelineContent: React.ReactNode[] = [];

  chapters.forEach((chapter, chapterIndex) => {
    const chapterModules = getModulesForChapter(chapter.id);
    if (chapterModules.length === 0) return;

    // Add chapter header
    timelineContent.push(renderChapterHeader(chapter, chapterIndex));

    // Add modules for this chapter
    chapterModules.forEach((module, moduleIndex) => {
      const isEven = globalModuleIndex % 2 === 0;
      timelineContent.push(renderModuleCard(module, moduleIndex, isEven, globalModuleIndex));
      globalModuleIndex++;
    });
  });

  // Add unassigned modules at the end
  if (unassignedModules.length > 0 && chapters.length > 0) {
    timelineContent.push(
      <div key="unassigned-header" className="relative py-6">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted md:left-1/2 md:-translate-x-1/2" />
        <div className="relative flex justify-center">
          <div className="flex items-center gap-3 rounded-full border-2 border-muted bg-card px-5 py-3 shadow-soft">
            <h2 className="font-heading text-base font-semibold text-muted-foreground">
              Additional Modules
            </h2>
          </div>
        </div>
      </div>
    );
  }

  unassignedModules.forEach((module, moduleIndex) => {
    const isEven = globalModuleIndex % 2 === 0;
    timelineContent.push(renderModuleCard(module, moduleIndex, isEven, globalModuleIndex));
    globalModuleIndex++;
  });

  // If no chapters, just render modules
  if (chapters.length === 0) {
    modules.forEach((module, index) => {
      const isEven = index % 2 === 0;
      timelineContent.push(renderModuleCard(module, index, isEven, index));
    });
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
            <div className="text-3xl font-bold text-success">{completedCount}</div>
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
            {timelineContent}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProgressPage;
