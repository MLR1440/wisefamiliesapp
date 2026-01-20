import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle, Clock, BookOpen, Gift, Users } from 'lucide-react';
import { useCoursePrice } from '@/hooks/useCoursePrice';

const valueItems = [
  { icon: BookOpen, text: "Complete AI-Ready Family Framework course" },
  { icon: Clock, text: "~3 hours of video content + exercises" },
  { icon: Gift, text: "4 exclusive bonuses ($164 value)" },
  { icon: Users, text: "Private parent community access" },
];

const CTA = () => {
  const { formattedPrice } = useCoursePrice();

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-12 sm:py-16 md:py-20 lg:py-28">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-accent/20 blur-3xl" />
      </div>
      
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-3 sm:mb-4 font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
            Ready to Raise AI-Ready Kids?
          </h2>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-primary-foreground/80 px-2 sm:px-0">
            Join parents who've already taken control of their family's AI future. Start today and see results in your first family conversation.
          </p>

          {/* Value Stack */}
          <div className="mb-8 p-4 sm:p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <p className="text-sm font-medium text-primary-foreground mb-4">
              Everything you get today:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {valueItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-left">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center">
                    <item.icon className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <span className="text-sm text-primary-foreground/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Link to="/signup" className="inline-block w-full sm:w-auto">
            <Button variant="cta" size="xl" className="gap-2 w-full sm:w-auto bg-gradient-cta hover:opacity-90 shadow-lg shadow-secondary/30">
              Get Instant Access for {formattedPrice}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          
          {/* Trust indicators */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-primary-foreground/80">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-success" />
              <span>90-Day Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>Lifetime Access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
