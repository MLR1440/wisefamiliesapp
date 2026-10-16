import { Shield, CheckCircle2 } from 'lucide-react';
import { courseRefundPolicy } from '@/lib/refundPolicy';

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
                90-day course refund
              </h3>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {courseRefundPolicy}
              </p>

              <ul className="space-y-3 text-left max-w-md mx-auto mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Request within 90 days of purchase</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Include a short note about what you tried</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Simple email request process</span>
                </li>
              </ul>

              <p className="text-sm text-muted-foreground italic">
                You do not need to complete every lesson or exercise to make a request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guarantee;
