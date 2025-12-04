import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockUser, mockModules, mockProgress } from '@/data/mockData';
import { Play, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const completedModules = mockProgress.filter((p) => p.completedAt).length;
  const totalModules = mockModules.length;
  const progressPercentage = (completedModules / totalModules) * 100;

  // Find the current module (first incomplete one)
  const currentModuleIndex = mockProgress.filter((p) => p.completedAt).length;
  const currentModule = mockModules[currentModuleIndex];

  const getModuleStatus = (moduleId: string) => {
    const progress = mockProgress.find((p) => p.moduleId === moduleId);
    if (progress?.completedAt) return 'completed';
    if (progress?.startedAt) return 'current';
    
    // Check if previous module is completed
    const moduleIndex = mockModules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === 0) return 'current';
    
    const previousModule = mockModules[moduleIndex - 1];
    const previousProgress = mockProgress.find((p) => p.moduleId === previousModule?.id);
    if (previousProgress?.completedAt) return 'current';
    
    return 'locked';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased userName={mockUser.firstName} />
      
      <main className="container py-8 md:py-12">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
            Welcome back, {mockUser.firstName}!
          </h1>
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
          <div className="space-y-3">
            {mockModules.map((module, index) => {
              const status = getModuleStatus(module.id);
              
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
                          In Progress
                        </span>
                      )}
                    </div>
                    <h3 className={`font-heading font-semibold ${
                      status === 'locked' ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {module.title}
                    </h3>
                  </div>

                  {/* Arrow */}
                  {status !== 'locked' && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
