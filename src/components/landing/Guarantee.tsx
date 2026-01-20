import { Shield, CheckCircle2 } from 'lucide-react';

const Guarantee = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-b from-primary/5 to-background">
      <div className="container px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl border-2 border-success/40 bg-gradient-to-br from-success/10 via-success/5 to-background p-6 sm:p-10 md:p-12 shadow-lg">
            {/* Shield icon with glow */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-success/30 blur-md scale-150" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-success to-primary shadow-lg">
                  <Shield className="h-7 w-7 text-success-foreground" />
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <h2 className="mb-4 font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                90-Day "Try It All" Guarantee
              </h2>
              
              <p className="mb-6 sm:mb-8 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                I'm so confident this course will transform how your family navigates AI that I'm giving you a full 90 days to go through every lesson, complete every exercise, and implement the strategies with your kids.
              </p>

              <div className="space-y-3 sm:space-y-4 text-left max-w-lg mx-auto mb-6 sm:mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-foreground">
                    Full access to all course materials immediately
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-foreground">
                    90 days to try everything, risk-free
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-foreground">
                    If you don't feel more confident about parenting in the AI age, just email us
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-card border border-border">
                <p className="text-sm sm:text-base text-muted-foreground italic">
                  "If after going through the course you don't feel significantly more confident about guiding your children's AI use, simply email me at <span className="text-foreground font-medium">support@wisefamilies.com</span> and I'll refund every penny. No questions asked, no hoops to jump through."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guarantee;
