import { useState, useEffect } from 'react';
import { Play, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Module {
  id: string;
  title: string;
  description: string;
  order_number: number;
}

const CoursePreview = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      const { data } = await supabase
        .from('modules')
        .select('id, title, description, order_number')
        .eq('status', 'published')
        .order('order_number', { ascending: true });
      
      setModules(data || []);
      setLoading(false);
    };

    fetchModules();
  }, []);

  return (
    <section className="bg-muted/50 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
            Course Curriculum
          </h2>
          <p className="text-lg text-muted-foreground">
            {modules.length > 0 
              ? `${modules.length} comprehensive modules designed to transform your family's relationship with AI`
              : "Comprehensive modules designed to transform your family's relationship with AI"
            }
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Course content coming soon!
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-soft"
                >
                  {/* Module number */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading font-semibold text-primary">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="mb-1 font-heading text-lg font-semibold text-foreground">
                      {module.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </div>

                  {/* Play icon */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 group-hover:bg-secondary group-hover:text-secondary-foreground">
                    <Play className="h-4 w-4" />
                  </div>
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
