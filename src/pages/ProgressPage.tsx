import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { mockUser, mockModules, mockProgress } from '@/data/mockData';
import { CheckCircle2, Circle, Play } from 'lucide-react';

const ProgressPage = () => {
  const getModuleStatus = (moduleId: string) => {
    const progress = mockProgress.find((p) => p.moduleId === moduleId);
    if (progress?.completedAt) return 'completed';
    if (progress?.startedAt) return 'in-progress';
    return 'not-started';
  };

  const completedCount = mockProgress.filter((p) => p.completedAt).length;
  const inProgressCount = mockProgress.filter((p) => p.startedAt && !p.completedAt).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased userName={mockUser.firstName} />

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
              {mockModules.length - completedCount - inProgressCount}
            </div>
            <div className="text-sm text-muted-foreground">Not Started</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-8">
            {mockModules.map((module, index) => {
              const status = getModuleStatus(module.id);
              const progress = mockProgress.find((p) => p.moduleId === module.id);
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
                          ? 'bg-primary text-primary-foreground'
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
                      {progress?.completedAt && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Completed on {progress.completedAt.toLocaleDateString()}
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
