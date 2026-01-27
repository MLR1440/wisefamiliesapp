import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle, Play, BookOpen, Bot, Users } from 'lucide-react';
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
            <span className="text-primary relative">
              Wiser Than the AI
              
            </span>{' '}
            They Use
          </h1>

          {/* Subheadline */}
          <p className="mb-8 sm:mb-10 text-lg sm:text-xl md:text-2xl text-muted-foreground animate-fade-up max-w-3xl leading-relaxed" style={{
          animationDelay: '0.1s'
        }}>The complete system for parents who want to prepare their children for an AI-powered future, without the fear, without the fights, without feeling like you're always one step behind.</p>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4 animate-fade-up mb-10" style={{
          animationDelay: '0.2s'
        }}>
            <a href="#course-content">
              <Button variant="cta" size="xl" className="gap-3 text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                See What's Inside
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-fade-up w-full max-w-3xl" style={{
          animationDelay: '0.3s'
        }}>
          {trustSignals.map((signal, index) => <a key={index} href={signal.href} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-background/70 transition-all cursor-pointer group">
                <CheckCircle className="h-7 w-7 text-success group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors">{signal.text}</span>
              </a>)}
          </div>

          {/* Founding member text */}
          <p className="mt-8 text-base sm:text-lg text-secondary font-semibold animate-fade-up" style={{
          animationDelay: '0.4s'
        }}>
            🎉 Join the first 100 founding families and lock in 60% off before the price increases.
          </p>
        </div>
      </div>
    </section>;
};
export default Hero;