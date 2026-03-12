import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle, Play, BookOpen, Bot, Users, Zap } from 'lucide-react';
import { useCourseSettings } from '@/hooks/useCourseSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { useFoundingSpots } from '@/hooks/useFoundingSpots';
import { Progress } from '@/components/ui/progress';

const trustSignals = [{
  icon: BookOpen,
  text: "7-chapter video course",
  href: "#course-content"
}, {
  icon: Bot,
  text: "AI-powered coaching tools",
  href: "#what-makes-this-different"
}, {
  icon: Users,
  text: "Private parent community",
  href: "#who-this-is-for"
}, {
  icon: Shield,
  text: "90-day money-back guarantee",
  href: "#guarantee"
}];
const Hero = () => {
  const { getSetting, loading } = useCourseSettings();
  const { spots, spotsTaken, totalSpots, isUrgent, isSoldOut } = useFoundingSpots();
  
  // Only compute these AFTER loading is complete to prevent race condition
  const heroVideoUrl = !loading ? getSetting('hero_video_url') : '';
  const heroVideoType = !loading ? (getSetting('hero_video_type') || 'vimeo') : 'vimeo';

  // Convert Vimeo URL to embed format
  const getVimeoEmbedUrl = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  // Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const renderVideo = () => {
    if (loading) {
      return <Skeleton className="w-full h-full" />;
    }

    if (!heroVideoUrl) {
      return null;
    }

    if (heroVideoType === 'vimeo') {
      const embedUrl = getVimeoEmbedUrl(heroVideoUrl);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            title="Hero Video"
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    if (heroVideoType === 'youtube') {
      const embedUrl = getYouTubeEmbedUrl(heroVideoUrl);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            title="Hero Video"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    if (heroVideoType === 'direct') {
      return (
        <video 
          controls 
          className="w-full h-full object-cover"
        >
          <source src={heroVideoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    return null;
  };

  // Show section during loading, or when we have a valid URL after loading completes
  const showVideoSection = loading || heroVideoUrl.length > 0;

  return <section className="relative overflow-hidden bg-gradient-warm py-16 sm:py-20 md:py-28 lg:py-36">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container px-4 sm:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Headline */}
          <h1 className="mb-6 sm:mb-8 font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground animate-fade-up leading-[1.1]">
            Raise Kids Who Are{' '}
            <span className="text-gold-400">Wiser</span>{' '}
            <span className="text-primary relative">
              Than the <span className="text-aipurple">AI</span>
            </span>{' '}
            They Use
          </h1>

          {/* Subheadline */}
          <p className="mb-8 sm:mb-10 text-lg sm:text-xl md:text-2xl text-muted-foreground animate-fade-up max-w-3xl leading-relaxed" style={{
          animationDelay: '0.1s'
        }}>The complete system for parents who want to prepare their children for an AI-powered future, without the fear, without the fights, without feeling like you're always one step behind.</p>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4 animate-fade-up mb-6" style={{
          animationDelay: '0.2s'
        }}>
            <a href="#course-content">
              <Button variant="cta" size="xl" className="gap-3 text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                See What's Inside
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </div>

          {/* Founding Member Counter Bar */}
          <div className="w-full max-w-md mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.22s' }}>
            {isSoldOut ? (
              <div className="px-6 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                <p className="text-sm font-semibold text-destructive">Founding member spots are full</p>
              </div>
            ) : (
              <div className="px-6 py-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className={`font-bold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
                    {spots} of {totalSpots} spots remaining
                  </span>
                  <span className="text-muted-foreground">{spotsTaken} claimed</span>
                </div>
                <Progress value={spotsTaken} className="h-2.5" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Founding member pricing — 60% off before spots fill up
                </p>
              </div>
            )}
          </div>

          {/* Hero Video */}
          {showVideoSection && (
            <div className="w-full max-w-4xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.25s' }}>
              <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-card shadow-xl">
                {renderVideo()}
              </div>
            </div>
          )}

          {/* Trust signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-fade-up w-full max-w-3xl" style={{
          animationDelay: '0.3s'
        }}>
          {trustSignals.map((signal, index) => <a key={index} href={signal.href} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-background/70 transition-all cursor-pointer group">
                <CheckCircle className="h-7 w-7 text-success group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors">{signal.text}</span>
              </a>)}
          </div>

          {!isSoldOut && (
            <p className="mt-8 text-base sm:text-lg text-secondary font-semibold animate-fade-up" style={{
            animationDelay: '0.4s'
          }}>
              🎉 97 founding member spots left — lock in 60% saving. (Normal Price $347)
            </p>
          )}
        </div>
      </div>
    </section>;
};
export default Hero;