import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useCoursePrice } from '@/hooks/useCoursePrice';

const CTA = () => {
  const { formattedPrice } = useCoursePrice();

  return (
    <section className="bg-gradient-hero py-12 sm:py-16 md:py-20 lg:py-28">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-3 sm:mb-4 font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
            Ready to Prepare Your Family for the AI Age?
          </h2>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-primary-foreground/80 px-2 sm:px-0">
            Join fellow parents who are taking action today. Your children's future starts now.
          </p>
          <Link to="/signup" className="inline-block w-full sm:w-auto">
            <Button variant="cta" size="xl" className="gap-2 w-full sm:w-auto">
              Get Instant Access for {formattedPrice}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          
          {/* Trust indicators */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-primary-foreground/70">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              <span>90-Day Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              <span>Lifetime Access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
