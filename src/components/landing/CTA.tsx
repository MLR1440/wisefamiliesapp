import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCoursePrice } from '@/hooks/useCoursePrice';

const CTA = () => {
  const { formattedPrice } = useCoursePrice();

  return (
    <section className="bg-gradient-hero py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Prepare Your Family for the AI Age?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Join hundreds of forward-thinking parents who are taking action today. 
            Your children's future starts now.
          </p>
          <Link to="/signup">
            <Button variant="cta" size="xl" className="gap-2">
              Get Instant Access — {formattedPrice}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-primary-foreground/60">
            30-day money-back guarantee • Lifetime access
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
