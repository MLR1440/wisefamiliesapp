import { useState, useEffect } from 'react';
import { Play, Clock, CheckCircle2, Loader2, ChevronDown, ChevronUp, Lock, Sparkles, Users, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Module {
  id: string;
  title: string;
  description: string;
  chapter_id: string | null;
  order_number: number;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  order_number: number;
}

interface ChapterWithModules extends Chapter {
  modules: Module[];
}

// Teaser highlights for each chapter
const chapterTeasers: Record<number, string[]> = {
  1: ["Discover the 3 AI myths holding your family back", "Quick-start guide to family AI conversations"],
  2: ["The apps your kids use that are secretly AI-powered", "Age-by-age breakdown of AI exposure risks"],
  3: ["5 signs your child is over-relying on AI", "The homework honesty framework"],
  4: ["Scripts for difficult AI conversations", "Setting boundaries that actually stick"],
  5: ["The creativity protection protocol", "Future-proof skills your child needs now"],
  6: ["Your 30-day AI-ready family action plan", "Ongoing resources and community access"],
};

const CoursePreview = () => {
  const [chaptersWithModules, setChaptersWithModules] = useState<ChapterWithModules[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const toggleExpanded = (chapterId: string) => {
    setExpandedChapter(prev => prev === chapterId ? null : chapterId);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [chaptersRes, modulesRes] = await Promise.all([
        supabase
          .from('chapters')
          .select('id, title, description, order_number')
          .eq('status', 'published')
          .order('order_number', { ascending: true }),
        supabase
          .from('modules')
          .select('id, title, description, chapter_id, order_number')
          .eq('status', 'published')
          .order('order_number', { ascending: true })
      ]);

      const chapters = chaptersRes.data || [];
      const modules = modulesRes.data || [];

      const grouped = chapters.map(chapter => ({
        ...chapter,
        modules: modules.filter(m => m.chapter_id === chapter.id)
      }));

      setChaptersWithModules(grouped);
      setLoading(false);
    };

    fetchData();
  }, []);

  const totalModules = chaptersWithModules.reduce((acc, ch) => acc + ch.modules.length, 0);

  return (
    <section className="bg-muted/50 py-12 sm:py-16 md:py-20 lg:py-28">
      <div className="container px-4 sm:px-6">
        {/* What You'll Master - Outcomes section */}
        <div className="mx-auto mb-10 sm:mb-14 max-w-3xl text-center">
          <p className="text-sm sm:text-base font-medium text-secondary mb-2">
            What's Inside
          </p>
          <h2 className="mb-4 sm:mb-6 font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Your Complete AI Parenting Roadmap
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8">
            {totalModules > 0 
              ? `${totalModules} video lessons with practical exercises you can use today`
              : "Comprehensive video lessons with practical exercises you can use today"
            }
          </p>
          
          {/* Mini outcomes preview */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Clock className="h-3.5 w-3.5" />
              ~3 hours total
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <BookOpen className="h-3.5 w-3.5" />
              {totalModules || 12}+ lessons
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Practical exercises
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : chaptersWithModules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Course content coming soon!
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {chaptersWithModules.map((chapter, chapterIndex) => {
                const isExpanded = expandedChapter === chapter.id;
                const teasers = chapterTeasers[chapterIndex + 1] || [];
                
                return (
                  <div
                    key={chapter.id}
                    className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-card"
                  >
                    {/* Chapter header - clickable */}
                    <button
                      onClick={() => toggleExpanded(chapter.id)}
                      className="w-full p-4 sm:p-5 bg-card hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading font-semibold text-primary text-sm sm:text-base">
                          {chapterIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground line-clamp-2">
                              {chapter.title}
                            </h3>
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {chapter.description}
                          </p>
                          
                          {/* Teaser highlights - always visible */}
                          {teasers.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {teasers.map((teaser, i) => (
                                <span 
                                  key={i}
                                  className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent-foreground px-2 py-1 rounded-full"
                                >
                                  <Sparkles className="h-3 w-3 text-accent" />
                                  {teaser}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded modules list */}
                    {isExpanded && chapter.modules.length > 0 && (
                      <div className="border-t border-border bg-muted/20">
                        {chapter.modules.map((module, moduleIndex) => (
                          <div
                            key={module.id}
                            className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-border/50 last:border-b-0"
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                              <Play className="h-3 w-3 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-foreground line-clamp-1">{module.title}</span>
                            </div>
                            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Course stats */}
          <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-4 rounded-xl bg-card border border-border">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-semibold text-foreground">~3 hrs</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Video Content</p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-xl bg-card border border-border">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-semibold text-foreground">{totalModules || 12}+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Lessons</p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-xl bg-card border border-border">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-semibold text-foreground">Exercises</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Interactive</p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-xl bg-card border border-border">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-semibold text-foreground">Lifetime</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Access</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 sm:mt-10 text-center">
            <Link to="/signup">
              <Button variant="cta" size="lg" className="w-full sm:w-auto">
                Unlock Full Course Access
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoursePreview;
