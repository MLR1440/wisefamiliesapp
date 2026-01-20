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
    <section className="bg-gradient-hero py-12 sm:py-16 md:py-20 lg:py-28">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-3 sm:mb-4 font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
            Ready to Raise AI-Ready Kids?
          </h2>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-primary-foreground/80 px-2 sm:px-0">
            Join parents who've already taken control of their family's AI future. Start today and see results in your first family conversation.
          </p>

          {/* Value Stack */}
          <div className="mb-8 p-4 sm:p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="text-sm font-medium text-primary-foreground/90 mb-4">
              Everything you get today:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {valueItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-left">
                  <item.icon className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="text-sm text-primary-foreground/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Link to="/signup" className="inline-block w-full sm:w-auto">
            <Button variant="cta" size="xl" className="gap-2 w-full sm:w-auto bg-secondary hover:bg-secondary/90">
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
