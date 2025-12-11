import { useState, useEffect } from 'react';
import { Play, Clock, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Module {
  id: string;
  title: string;
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

const CoursePreview = () => {
  const [chaptersWithModules, setChaptersWithModules] = useState<ChapterWithModules[]>([]);
  const [loading, setLoading] = useState(true);

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
          .select('id, title, chapter_id, order_number')
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
    <section className="bg-muted/50 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
            Course Curriculum
          </h2>
          <p className="text-lg text-muted-foreground">
            {totalModules > 0 
              ? `${totalModules} comprehensive modules designed to transform your family's relationship with AI`
              : "Comprehensive modules designed to transform your family's relationship with AI"
            }
          </p>
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
            <div className="space-y-6">
              {chaptersWithModules.map((chapter, chapterIndex) => (
                <div
                  key={chapter.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Chapter header */}
                  <div className="p-5 bg-muted/30">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading font-semibold text-primary">
                        {chapterIndex + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-semibold text-foreground">
                          {chapter.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {chapter.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Modules list */}
                  {chapter.modules.length > 0 && (
                    <div className="border-t border-border">
                      {chapter.modules.map((module, moduleIndex) => (
                        <div
                          key={module.id}
                          className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                        >
                          <Play className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-foreground">{module.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Course stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>~3 hours of content</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Interactive exercises</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span>Lifetime access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoursePreview;
