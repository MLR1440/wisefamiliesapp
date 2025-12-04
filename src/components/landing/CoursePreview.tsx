import { mockModules } from '@/data/mockData';
import { Play, Clock, CheckCircle2 } from 'lucide-react';

const CoursePreview = () => {
  const publishedModules = mockModules.filter(m => m.status === 'published');

  return (
    <section className="bg-muted/50 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
            Course Curriculum
          </h2>
          <p className="text-lg text-muted-foreground">
            6 comprehensive modules designed to transform your family's relationship with AI
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="space-y-4">
            {publishedModules.map((module, index) => (
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
