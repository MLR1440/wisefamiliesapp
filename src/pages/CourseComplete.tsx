import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Trophy, PartyPopper, ArrowRight, Star, Heart, CheckCircle2 } from 'lucide-react';
import VideoPlayer from '@/components/module/VideoPlayer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CourseSettings {
  congratulations_video_url?: string;
  congratulations_video_type?: string;
  congratulations_title?: string;
  congratulations_message?: string;
}

const CourseComplete = () => {
  const { user, hasAccess, isAdmin } = useAuth();
  const [settings, setSettings] = useState<CourseSettings>({});
  const [loading, setLoading] = useState(true);
  
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('course_settings')
        .select('key, value')
        .in('key', [
          'congratulations_video_url',
          'congratulations_video_type',
          'congratulations_title',
          'congratulations_message'
        ]);

      if (data) {
        const settingsObj: CourseSettings = {};
        data.forEach(item => {
          (settingsObj as any)[item.key] = item.value;
        });
        setSettings(settingsObj);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const defaultTitle = `Congratulations, ${userName}! 🎉`;
  const defaultMessage = "You've completed the entire A.I - Ready Family Framework course! We're so proud of the commitment you've shown to your family's future. You now have the tools and knowledge to guide your children confidently into the age of AI.";

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />

      <main className="container py-8 md:py-12">
        {/* Celebration header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cta mb-6">
            <Trophy className="h-10 w-10 text-secondary-foreground" />
          </div>
          
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {settings.congratulations_title || defaultTitle}
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            {settings.congratulations_message || defaultMessage}
          </p>
        </div>

        {/* Video section */}
        {settings.congratulations_video_url && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="rounded-2xl overflow-hidden border border-border shadow-soft">
              <VideoPlayer
                videoUrl={settings.congratulations_video_url}
                videoType={settings.congratulations_video_type || 'youtube'}
                title="Congratulations Message"
              />
            </div>
          </div>
        )}

        {/* Achievement cards */}
        <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto mb-12">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-2">Course Complete</h3>
            <p className="text-sm text-muted-foreground">You've finished all modules in the framework</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-4">
              <Star className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-2">AI-Ready Parent</h3>
            <p className="text-sm text-muted-foreground">You're equipped to guide your family's AI journey</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-2">Lifelong Access</h3>
            <p className="text-sm text-muted-foreground">Return anytime to revisit the course materials</p>
          </div>
        </div>

        {/* Decorative confetti elements */}
        <div className="flex justify-center gap-2 mb-8">
          <PartyPopper className="h-8 w-8 text-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
          <PartyPopper className="h-8 w-8 text-primary animate-bounce" style={{ animationDelay: '100ms' }} />
          <PartyPopper className="h-8 w-8 text-secondary animate-bounce" style={{ animationDelay: '200ms' }} />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard">
            <Button variant="soft" size="lg" className="w-full sm:w-auto gap-2">
              View Course Dashboard
            </Button>
          </Link>
          <Link to="/progress">
            <Button variant="cta" size="lg" className="w-full sm:w-auto gap-2">
              View Your Progress
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseComplete;
