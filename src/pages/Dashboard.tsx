import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle2, Lock, ArrowRight, Loader2, ChevronDown, User, Heart, AlertCircle, Pencil, Clock, Users, MessageSquare, FileText, Download, Trash2 } from 'lucide-react';
import { CircularProgress } from '@/components/ui/circular-progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Paywall from '@/components/Paywall';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserDocuments } from '@/hooks/useUserDocuments';
import { downloadDocument } from '@/lib/documentGenerators';
import { toast } from '@/hooks/use-toast';

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
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const userId = user?.id || '';
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';
  
  const { documents, loading: docsLoading, deleteDocument } = useUserDocuments({ userId });

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

  const handleDocumentDownload = async (doc: typeof documents[0]) => {
    setDownloadingDocId(doc.id);
    try {
      await downloadDocument(doc.document_data);
      toast({
        title: 'Document downloaded!',
        description: 'Open it in Google Docs, Word, or any word processor.',
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleDocumentDelete = async (docId: string) => {
    try {
      await deleteDocument(docId);
      toast({
        title: 'Document deleted',
        description: 'The document has been removed.',
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
              ? 'bg-primary/10 hover:bg-primary/15 border-l-2 border-primary' 
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
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-sm font-medium truncate ${status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}>
              {module.title}
            </span>
            {status === 'current' && (
              <span className="shrink-0 rounded-full bg-primary/15 text-primary text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                Current
              </span>
            )}
          </div>
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

        {/* Progress hero with ring + Continue */}
        <div className="mb-6 rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <CircularProgress value={progressPercentage} size={104} strokeWidth={9} gradient className="shadow-glow rounded-full">
              <div className="text-center">
                <p className="font-heading text-2xl font-semibold text-foreground leading-none">
                  {Math.round(progressPercentage)}%
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                  Complete
                </p>
              </div>
            </CircularProgress>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span className="font-medium text-foreground">{completedModules}</span>
                  <span className="text-muted-foreground">done</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gold-400" />
                  <span className="font-medium text-foreground">{inProgressModules}</span>
                  <span className="text-muted-foreground">in progress</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{remainingModules}</span>
                  <span className="text-muted-foreground">remaining</span>
                </span>
              </div>

              {currentModule && completedModules < totalModules ? (
                <>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Up next
                  </p>
                  <Link
                    to={`/course/${currentModule.id}`}
                    className="group block"
                  >
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-colors p-3 border border-secondary/30">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">
                          {currentModule.title}
                        </p>
                      </div>
                      <Button size="sm" variant="cta" className="gap-2 shrink-0">
                        Continue
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {completedModules === totalModules ? 'Course completed — well done!' : 'Ready when you are.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick access row: Profile / Documents / Community */}
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {/* Child profile summary */}
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <User className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Child Profile</h3>
            </div>
            {profileLoading ? (
              <div className="flex items-center justify-center py-4 flex-1">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : profile?.onboarding_completed ? (
              <>
                <div className="flex-1 space-y-1.5 mb-3 text-sm">
                  {profile.child_age && (
                    <p className="text-muted-foreground">
                      <span className="text-foreground font-medium">{profile.child_age}</span>
                      {profile.child_gender ? ` · ${profile.child_gender}` : ''}
                    </p>
                  )}
                  {profile.child_likes && (
                    <p className="text-muted-foreground line-clamp-2">
                      <Heart className="inline h-3 w-3 text-success mr-1 -mt-0.5" />
                      {profile.child_likes}
                    </p>
                  )}
                </div>
                <Link to="/profile" className="mt-auto">
                  <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3 flex-1">
                  Personalize the AI coach for your child.
                </p>
                <Link to="/profile" className="mt-auto">
                  <Button variant="outline" size="sm" className="gap-2 w-full">
                    Set up profile
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Documents summary */}
          <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">My Documents</h3>
              {documents.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">{documents.length}</span>
              )}
            </div>
            {docsLoading ? (
              <div className="flex items-center justify-center py-4 flex-1">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground flex-1">
                Complete Module 16 or 21 to create personalized documents.
              </p>
            ) : (
              <div className="space-y-2 flex-1">
                {documents.slice(0, 2).map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDate(doc.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDocumentDownload(doc)}
                        disabled={downloadingDocId === doc.id}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        {downloadingDocId === doc.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDocumentDelete(doc.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {documents.length > 2 && (
                  <p className="text-xs text-muted-foreground pl-1">
                    + {documents.length - 2} more
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Community summary */}
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 text-green-700">
                <Users className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Community</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3 flex-1">
              Connect with other parents navigating AI together.
            </p>
            <Link to="/community" className="mt-auto">
              <Button variant="outline" size="sm" className="gap-2 w-full">
                <MessageSquare className="h-3.5 w-3.5" />
                Join discussion
              </Button>
            </Link>
          </div>
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
                const chapterPct = chapterModules.length > 0 ? (completedInChapter / chapterModules.length) * 100 : 0;
                const chapterDone = completedInChapter === chapterModules.length;
                
                return (
                  <Collapsible 
                    key={chapter.id} 
                    open={openChapters.has(chapter.id)} 
                    onOpenChange={() => toggleChapter(chapter.id)}
                  >
                    <div className={`rounded-xl border overflow-hidden transition-colors ${chapterDone ? 'border-success/30 bg-success/5' : 'border-border bg-card'}`}>
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-3 w-full p-4 hover:bg-muted/30 transition-colors text-left">
                          <ChevronDown className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${openChapters.has(chapter.id) ? '' : '-rotate-90'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground truncate">
                                {chapter.title}
                              </h3>
                              {chapterDone && (
                                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`h-full transition-all duration-500 ${chapterDone ? 'bg-success' : 'bg-primary'}`}
                                  style={{ width: `${chapterPct}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-medium text-muted-foreground shrink-0 tabular-nums">
                                {completedInChapter}/{chapterModules.length}
                              </span>
                            </div>
                          </div>
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
