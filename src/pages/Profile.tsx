import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save, Trash2, AlertTriangle, Mail } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAdmin, hasAccess, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState('');
  const [childLikes, setChildLikes] = useState('');
  const [childDislikes, setChildDislikes] = useState('');
  const [currentIssues, setCurrentIssues] = useState('');

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setChildAge(profile.child_age || '');
        setChildGender(profile.child_gender || '');
        setChildLikes(profile.child_likes || '');
        setChildDislikes(profile.child_dislikes || '');
        setCurrentIssues(profile.current_issues || '');
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const profileData = {
        user_id: user.id,
        child_age: childAge,
        child_gender: childGender,
        child_likes: childLikes,
        child_dislikes: childDislikes,
        current_issues: currentIssues,
        onboarding_completed: true,
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Profile updated! ✓",
        description: "Your AI coaching will now use this updated information.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClearChildData = async () => {
    if (!user) return;
    
    setClearingData(true);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          child_age: null,
          child_gender: null,
          child_likes: null,
          child_dislikes: null,
          current_issues: null,
          onboarding_completed: false,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Reset local state
      setChildAge('');
      setChildGender('');
      setChildLikes('');
      setChildDislikes('');
      setCurrentIssues('');
      setClearDialogOpen(false);

      toast({
        title: "Child data cleared",
        description: "Your child's profile has been reset.",
      });
    } catch (error) {
      console.error('Error clearing child data:', error);
      toast({
        title: "Error clearing data",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setClearingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    
    setDeletingAccount(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) throw response.error;

      await signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account and all data have been removed.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error deleting account",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setDeletingAccount(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmText('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
      
      <main className="container py-6 md:py-12 max-w-2xl mx-auto px-4">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-base text-muted-foreground">
            Manage your profile and account settings
          </p>
        </div>

        <Tabs defaultValue="child-profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="child-profile">Child's Profile</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="child-profile">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-5 md:space-y-6">
                {/* Child Age */}
                <div className="space-y-2">
                  <Label htmlFor="childAge" className="text-base font-medium">
                    What is your child's age?
                  </Label>
                  <Select value={childAge} onValueChange={setChildAge}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2" className="text-base">0-2 years (Infant/Toddler)</SelectItem>
                      <SelectItem value="3-5" className="text-base">3-5 years (Preschool)</SelectItem>
                      <SelectItem value="6-8" className="text-base">6-8 years (Early Elementary)</SelectItem>
                      <SelectItem value="9-11" className="text-base">9-11 years (Late Elementary)</SelectItem>
                      <SelectItem value="12-14" className="text-base">12-14 years (Middle School)</SelectItem>
                      <SelectItem value="15-17" className="text-base">15-17 years (High School)</SelectItem>
                      <SelectItem value="18+" className="text-base">18+ years (Young Adult)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Child Gender */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">What is your child's gender?</Label>
                  <RadioGroup value={childGender} onValueChange={setChildGender} className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="text-base font-normal cursor-pointer">Boy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="text-base font-normal cursor-pointer">Girl</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non-binary" id="non-binary" />
                      <Label htmlFor="non-binary" className="text-base font-normal cursor-pointer">Non-binary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                      <Label htmlFor="prefer-not-to-say" className="text-base font-normal cursor-pointer">Prefer not to say</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Likes */}
                <div className="space-y-2">
                  <Label htmlFor="likes" className="text-base font-medium">
                    What does your child enjoy? (hobbies, interests)
                  </Label>
                  <Textarea
                    id="likes"
                    value={childLikes}
                    onChange={(e) => setChildLikes(e.target.value)}
                    placeholder="e.g., Playing Minecraft, watching YouTube, drawing, sports..."
                    className="min-h-[100px] text-base resize-none"
                  />
                </div>

                {/* Dislikes */}
                <div className="space-y-2">
                  <Label htmlFor="dislikes" className="text-base font-medium">
                    What does your child dislike or struggle with?
                  </Label>
                  <Textarea
                    id="dislikes"
                    value={childDislikes}
                    onChange={(e) => setChildDislikes(e.target.value)}
                    placeholder="e.g., Homework, early bedtimes, sharing devices..."
                    className="min-h-[100px] text-base resize-none"
                  />
                </div>

                {/* Current Issues */}
                <div className="space-y-2">
                  <Label htmlFor="issues" className="text-base font-medium">
                    What parenting challenges are you currently facing?
                  </Label>
                  <Textarea
                    id="issues"
                    value={currentIssues}
                    onChange={(e) => setCurrentIssues(e.target.value)}
                    placeholder="e.g., Too much screen time, gaming addiction, social media concerns, AI safety..."
                    className="min-h-[120px] text-base resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  variant="cta"
                  size="lg"
                  className="flex-1 gap-2 h-12 text-base"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Link to="/dashboard" className="sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="h-12 text-base w-full"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="account">
            <div className="space-y-6">
              {/* Email display */}
              <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <Label className="text-base font-medium">Email Address</Label>
                </div>
                <p className="text-muted-foreground">{userEmail}</p>
              </div>

              {/* Danger Zone */}
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Clear Child Data */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-background border border-border">
                    <div>
                      <p className="font-medium text-foreground">Clear Child Data</p>
                      <p className="text-sm text-muted-foreground">
                        Remove all child profile information and restart onboarding
                      </p>
                    </div>
                    <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 shrink-0">
                          <Trash2 className="h-4 w-4" />
                          Clear Data
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Clear Child Data?</DialogTitle>
                          <DialogDescription>
                            This will remove all child profile information and reset your onboarding status. 
                            Your course progress will be preserved.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button variant="ghost" onClick={() => setClearDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleClearChildData}
                            disabled={clearingData}
                          >
                            {clearingData ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Clear Data'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Delete Account */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-background border border-border">
                    <div>
                      <p className="font-medium text-foreground">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
                      setDeleteDialogOpen(open);
                      if (!open) setDeleteConfirmText('');
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2 shrink-0">
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-destructive">Delete Account?</DialogTitle>
                          <DialogDescription className="space-y-3">
                            <p>
                              This action is <strong>permanent and irreversible</strong>. All your data will be deleted, including:
                            </p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              <li>Your profile and child information</li>
                              <li>Course progress and chat history</li>
                              <li>Purchase records</li>
                            </ul>
                            <p className="pt-2">
                              Type <strong>DELETE</strong> below to confirm:
                            </p>
                          </DialogDescription>
                        </DialogHeader>
                        <Input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="Type DELETE to confirm"
                          className="font-mono"
                        />
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                          >
                            {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete My Account'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
