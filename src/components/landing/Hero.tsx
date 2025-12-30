import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, CheckCircle } from 'lucide-react';
import { useCoursePrice } from '@/hooks/useCoursePrice';

const Hero = () => {
  const { formattedPrice } = useCoursePrice();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-12 sm:py-16 md:py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-32 w-32 sm:h-48 sm:w-48 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-muted-foreground animate-fade-in">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
            The AI-Ready Family Framework
          </div>

          {/* Headline */}
          <h1 
            className="mb-4 sm:mb-6 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground animate-fade-up leading-tight"
            style={{ animationDelay: '0.1s' }}
          >
            Raise Kids Who Are{' '}
            <span className="text-gradient">Wiser Than the AI</span>{' '}
            They Use
          </h1>

          {/* Subheadline */}
          <p 
            className="mb-6 sm:mb-8 text-base sm:text-lg md:text-xl text-muted-foreground animate-fade-up px-2 sm:px-0"
            style={{ animationDelay: '0.2s' }}
          >
            A proven framework to help your children think critically, create authentically, and thrive in an AI-enhanced world.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col items-center justify-center gap-3 sm:gap-4 animate-fade-up px-4 sm:px-0"
            style={{ animationDelay: '0.3s' }}
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="cta" size="xl" className="gap-2 w-full sm:w-auto text-sm sm:text-base">
                Get Instant Access for {formattedPrice}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline-primary" size="lg" className="w-full sm:w-auto">
                Already a member? Login
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div 
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground animate-fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              <span>90-Day Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Lifetime Access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;