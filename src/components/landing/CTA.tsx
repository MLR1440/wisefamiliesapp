import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-green-400/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-secondary/20 blur-3xl" />
      </div>
      
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 font-heading text-3xl md:text-4xl font-bold text-primary-foreground">
            Your Child's Future Starts Today
          </h2>
          
          <p className="mb-4 text-lg text-primary-foreground/90 leading-relaxed">
            AI isn't going away. The question isn't whether your child will use it — it's whether they'll use it wisely.
          </p>
          
          <p className="mb-4 text-lg text-primary-foreground/90 leading-relaxed">
            The families who thrive in an AI-powered world won't be the ones who banned technology or the ones who ignored it. They'll be the ones who prepared their children to think for themselves AND use AI as a tool.
          </p>
          
          <p className="mb-8 text-lg text-primary-foreground/90 font-medium">
            That's what the AI-Ready Families System gives you.
          </p>
          
          <Link to="/signup" className="inline-block">
            <Button variant="cta" size="xl" className="gap-2 shadow-lg">
              Join the Founding 100
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          
          <p className="mt-8 text-sm text-primary-foreground/70">
            Questions? Email{' '}
            <a href="mailto:hello@wisefamilies.co" className="underline hover:text-primary-foreground">
              hello@wisefamilies.co
            </a>
            {' '}— we read every message.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
