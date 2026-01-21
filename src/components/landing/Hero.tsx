import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle, Play, BookOpen, Bot, Users } from 'lucide-react';

const trustSignals = [
  { icon: BookOpen, text: "7-chapter video course" },
  { icon: Bot, text: "AI-powered coaching tools" },
  { icon: Users, text: "Private parent community" },
  { icon: Shield, text: "90-day money-back guarantee" },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-warm py-12 sm:py-16 md:py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            {/* Headline */}
            <h1 className="mb-4 sm:mb-6 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground animate-fade-up leading-tight">
              Raise Kids Who Are{' '}
              <span className="text-primary">Wiser Than the AI</span>{' '}
              They Use
            </h1>

            {/* Subheadline */}
            <p className="mb-6 sm:mb-8 text-base sm:text-lg md:text-xl text-muted-foreground animate-fade-up" style={{ animationDelay: '0.1s' }}>
              The complete system for parents who want to prepare their children for an AI-powered future — without the fear, without the fights, without feeling like you're always one step behind.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col items-center lg:items-start gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <a href="#course-content" className="w-full sm:w-auto">
                <Button variant="cta" size="xl" className="gap-2 w-full sm:w-auto">
                  See What's Inside
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            </div>

            {/* Trust signals */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              {trustSignals.map((signal, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span>{signal.text}</span>
                </div>
              ))}
            </div>

            {/* Founding member text */}
            <p className="mt-6 text-sm text-secondary font-medium animate-fade-up" style={{ animationDelay: '0.4s' }}>
              Join the first 100 founding families and lock in 60% off before the price increases.
            </p>
          </div>

          {/* Right: Video placeholder */}
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative aspect-video rounded-2xl bg-card border-2 border-primary/20 overflow-hidden shadow-card group cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
                    <Play className="h-7 w-7 sm:h-8 sm:w-8 ml-1" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">Watch the overview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
