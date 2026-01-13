import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle2, Lock, ArrowRight, Loader2, ChevronDown, User, Heart, AlertCircle, Pencil, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Paywall from '@/components/Paywall';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUserProfile } from '@/hooks/useUserProfile';

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
  const { user, hasAccess, checkingPayment, isAdmin } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
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

      const [chaptersRes, modulesRes, progressRes] = await Promise.all([
        supabase.from('chapters').select('id, title, description, order_number').eq('status', 'published').order('order_number'),
        supabase.from('modules').select('id, title, description, order_number, chapter_id').eq('status', 'published').order('order_number'),
        supabase.from('user_progress').select('module_id, started_at, completed_at, first_prompt_clicked').eq('user_id', userId)
      ]);

      setChapters(chaptersRes.data || []);
      setModules(modulesRes.data || []);
      setProgress(progressRes.data || []);

      if (chaptersRes.data) {
        setOpenChapters(new Set(chaptersRes.data.map(c => c.id)));
      }
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const completedModules = progress.filter(p => p.completed_at).length;
  const inProgressModules = progress.filter(p => p.started_at && !p.completed_at).length;
  const totalModules = modules.length;
  const remainingModules = totalModules - completedModules - inProgressModules;
  const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  const getModulesForChapter = (chapterId: string) => {
    return modules.filter(m => m.chapter_id === chapterId).sort((a, b) => a.order_number - b.order_number);
  };

  const unassignedModules = modules.filter(m => !m.chapter_id);
  const allModulesInOrder = [...chapters.flatMap(chapter => getModulesForChapter(chapter.id)), ...unassignedModules];

  const getModuleStatus = (moduleId: string) => {
    const moduleProgress = progress.find(p => p.module_id === moduleId);
    if (moduleProgress?.completed_at) return 'completed';
    if (moduleProgress?.started_at || moduleProgress?.first_prompt_clicked) return 'current';

    const moduleIndex = allModulesInOrder.findIndex(m => m.id === moduleId);
    if (moduleIndex === 0) return 'current';
    const previousModule = allModulesInOrder[moduleIndex - 1];
    if (previousModule) {
      const previousProgress = progress.find(p => p.module_id === previousModule.id);
      if (previousProgress?.completed_at) return 'current';
    }
    return 'locked';
  };

  const currentModule = allModulesInOrder.find(module => getModuleStatus(module.id) === 'current') || allModulesInOrder[0];

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

  const renderModuleItem = (module: Module) => {
    const status = getModuleStatus(module.id);
    
    return (
      <Link 
        key={module.id} 
        to={status !== 'locked' ? `/course/${module.id}` : '#'} 
        className={`group flex items-center gap-3 rounded-lg p-3 transition-colors ${
          status === 'locked' 
            ? 'cursor-not-allowed opacity-50' 
            : status === 'current' 
              ? 'bg-primary/5 hover:bg-primary/10' 
              : 'hover:bg-muted/50'
        }`} 
        onClick={e => status === 'locked' && e.preventDefault()}
      >
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          status === 'completed' ? 'bg-success text-success-foreground' : 
          status === 'current' ? 'bg-primary text-primary-foreground' : 
          'bg-muted text-muted-foreground'
        }`}>
          {status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : 
           status === 'locked' ? <Lock className="h-3.5 w-3.5" /> : 
           <Play className="h-3.5 w-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}>
            {module.title}
          </span>
        </div>
        {status === 'current' && !progress.find(p => p.module_id === module.id)?.started_at && (
          <span className="text-xs text-primary font-medium">Start</span>
        )}
        {status !== 'locked' && <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
      </Link>
    );
  };

  if (loading || checkingPayment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} />
        <main className="container max-w-4xl py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={false} userName={userName} />
        <main className="container max-w-4xl py-12">
          <div className="mb-8">
            <h1 className="mb-2 font-heading text-2xl font-semibold text-foreground">
              Welcome, {userName}
            </h1>
            <p className="text-muted-foreground">
              Get started with the A.I - Ready Family Framework
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2">
            <Paywall />
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Course Preview</p>
              {modules.slice(0, 3).map((module, index) => (
                <div key={module.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-muted-foreground">{module.title}</span>
                </div>
              ))}
              {modules.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  + {modules.length - 3} more modules
                </p>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
      
      <main className="container max-w-4xl py-8 md:py-12">
        {/* Simple welcome */}
        <div className="mb-8">
          <h1 className="mb-1 font-heading text-2xl font-semibold text-foreground">
            Welcome back, {userName}
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey
          </p>
        </div>

        {/* Clean progress section */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          {/* Stats row */}
          <div className="flex gap-6 mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <div>
                <p className="text-2xl font-semibold text-success">{completedModules}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-semibold text-primary">{inProgressModules}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold text-muted-foreground">{remainingModules}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Progress value={progressPercentage} className="h-2 flex-1 max-w-xs" />
                <span className="text-sm font-medium text-muted-foreground">
                  {completedModules}/{totalModules}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {completedModules === totalModules 
                  ? 'Course completed!' 
                  : `${totalModules - completedModules} modules remaining`
                }
              </p>
            </div>
            
            {currentModule && (
              <Link to={`/course/${currentModule.id}`}>
                <Button className="gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Child Profile Section */}
        <div className="mb-10 rounded-xl border border-border bg-card p-6">
          {profileLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : profile?.onboarding_completed ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-foreground">Your Child's Profile</h3>
                </div>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  {profile.child_age && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Age Range</p>
                      <p className="text-sm text-foreground">{profile.child_age}</p>
                    </div>
                  )}
                  {profile.child_gender && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Gender</p>
                      <p className="text-sm text-foreground">{profile.child_gender}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {profile.child_likes && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Heart className="h-3 w-3 text-success" />
                        <p className="text-xs text-muted-foreground">Interests</p>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">{profile.child_likes}</p>
                    </div>
                  )}
                  {profile.current_issues && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <AlertCircle className="h-3 w-3 text-warning" />
                        <p className="text-xs text-muted-foreground">Current Challenges</p>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">{profile.current_issues}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <User className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Complete your child's profile to get personalized AI coaching
              </p>
              <Link to="/profile">
                <Button variant="outline" size="sm" className="gap-2">
                  Set Up Profile
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Course content */}
        <div>
          <h2 className="mb-4 text-lg font-medium text-foreground">
            Course Content
          </h2>
          
          {allModulesInOrder.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <p className="text-muted-foreground">No content available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map(chapter => {
                const chapterModules = getModulesForChapter(chapter.id);
                if (chapterModules.length === 0) return null;
                const completedInChapter = chapterModules.filter(m => progress.find(p => p.module_id === m.id)?.completed_at).length;
                
                return (
                  <Collapsible 
                    key={chapter.id} 
                    open={openChapters.has(chapter.id)} 
                    onOpenChange={() => toggleChapter(chapter.id)}
                  >
                    <div className="rounded-xl border border-border overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-3 w-full p-4 hover:bg-muted/30 transition-colors text-left">
                          <ChevronDown className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${openChapters.has(chapter.id) ? '' : '-rotate-90'}`} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground">
                              {chapter.title}
                            </h3>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {completedInChapter}/{chapterModules.length}
                          </span>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-1">
                          {chapterModules.map(module => renderModuleItem(module))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}

              {unassignedModules.length > 0 && chapters.length > 0 && (
                <div className="space-y-1 pt-4">
                  <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
                    Additional Modules
                  </p>
                  {unassignedModules.map(module => renderModuleItem(module))}
                </div>
              )}

              {chapters.length === 0 && (
                <div className="space-y-1">
                  {modules.map(module => renderModuleItem(module))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
