import { Shield, CheckCircle2 } from 'lucide-react';

const Guarantee = () => {
  return (
    <section className="py-16 md:py-24 bg-primary/5">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            The WiseFamilies Promise
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative bg-card rounded-2xl p-8 md:p-12 shadow-card border border-border">
            {/* Shield icon with glow */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-success/20 blur-xl rounded-full" />
                <div className="relative w-16 h-16 rounded-full bg-success flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-success-foreground" />
                </div>
              </div>
            </div>

            <div className="pt-8 text-center">
              <h3 className="font-heading text-2xl font-bold text-foreground mb-6">
                90-Day "Try It All" Guarantee
              </h3>

              <p className="text-muted-foreground leading-relaxed mb-6">
                I'm so confident this course will transform how your family navigates AI that I'm giving you a full 90 days to go through every lesson, complete every exercise, and implement the strategies with your child.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-8">
                If you don't see a real difference in how your family approaches technology, email us for a full refund. No awkward conversations. No hoops to jump through.
              </p>

              <ul className="space-y-3 text-left max-w-md mx-auto mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Full 90 days to try everything</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">No questions asked refund</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Simple email request process</span>
                </li>
              </ul>

              <p className="text-sm text-muted-foreground italic">
                I believe in this system because it works. If it doesn't work for you, I don't want your money.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guarantee;