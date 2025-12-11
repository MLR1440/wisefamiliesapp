import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useCoursePrice } from '@/hooks/useCoursePrice';
const Hero = () => {
  const {
    formattedPrice
  } = useCoursePrice();
  return <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground animate-fade-in">
            <Sparkles className="h-4 w-4 text-accent" />
            The AI-Ready Parenting Framework
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight text-foreground animate-fade-up md:text-5xl lg:text-6xl" style={{
          animationDelay: '0.1s'
        }}>
            Raise Kids Who Are{' '}
            <span className="text-gradient">Wiser Than the AI</span>{' '}
            They Use
          </h1>

          {/* Subheadline */}
          <p className="mb-8 text-lg text-muted-foreground animate-fade-up md:text-xl" style={{
          animationDelay: '0.2s'
        }}>A framework to help your children think critically, create authentically, and thrive in an AI-enhanced world. Start your family's journey today.</p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 animate-fade-up sm:flex-row" style={{
          animationDelay: '0.3s'
        }}>
            <Link to="/signup">
              <Button variant="cta" size="xl" className="gap-2">
                Get Instant Access for {formattedPrice}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline-primary" size="lg">
                Already a member? Login
              </Button>
            </Link>
          </div>

          {/* Trust indicator */}
          <p className="mt-8 text-sm text-muted-foreground animate-fade-up" style={{
          animationDelay: '0.4s'
        }}>Join Fellow Families already raising AI-ready kids</p>
        </div>
      </div>
    </section>;
};
export default Hero;