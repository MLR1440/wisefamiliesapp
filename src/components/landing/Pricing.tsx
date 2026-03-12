import { Button } from '@/components/ui/button';

import { Check, Shield, Lock, Zap, Star } from 'lucide-react';
import { usePaymentLinks } from '@/hooks/usePaymentLinks';
import { useFoundingSpots } from '@/hooks/useFoundingSpots';
import { useCoursePrice } from '@/hooks/useCoursePrice';
import { usePremiumPrice } from '@/hooks/usePremiumPrice';
import { Progress } from '@/components/ui/progress';

const coreFeatures = ["12-month course access", "Complete 7-chapter video course", "AI-powered coaching tools", "Custom Family Tech Agreement builder", "Conversation script generator", "Private parent community (12 months)", "Downloadable resources & frameworks", "90-day money-back guarantee"];
const premiumExtras = ["36-month course access (3 years)", "1-hour private video consultation with a qualified child psychologist", "Personalised assessment of your child's AI use", "Custom action plan designed specifically for your family", "Priority community support", "Extended community access (36 months)"];

const Pricing = () => {
  const { coreLink, coreInstallmentsLink, premiumLink } = usePaymentLinks();
  const { spots, spotsTaken, totalSpots, isUrgent, isSoldOut } = useFoundingSpots();
  const { formattedPrice, loading: priceLoading } = useCoursePrice();
  const { formattedPrice: formattedPremiumPrice, loading: premiumPriceLoading } = usePremiumPrice();

  const handleCoreClick = () => {
    if (coreLink) window.open(coreLink, '_blank', 'noopener,noreferrer');
  };
  const handleCoreInstallmentsClick = () => {
    if (coreInstallmentsLink) window.open(coreInstallmentsLink, '_blank', 'noopener,noreferrer');
  };
  const handlePremiumClick = () => {
    if (premiumLink) window.open(premiumLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Path
          </h2>
          {isSoldOut ? (
            <p className="text-lg text-destructive font-semibold">
              Founding member spots are full — join the waitlist for the next intake.
            </p>
          ) : (
            <>
              <p className="text-lg text-muted-foreground mb-4">
                Founding Member Pricing — Limited Spots Remaining
              </p>
              <div className="mx-auto max-w-md">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className={`font-bold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
                    {spots} of {totalSpots} spots remaining
                  </span>
                  <span className="text-muted-foreground">{spotsTaken} claimed</span>
                </div>
                <Progress value={(spotsTaken / totalSpots) * 100} className="h-3" />
              </div>
            </>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Core Offer */}
          <div className="relative bg-card rounded-2xl p-8 shadow-card border-2 border-secondary">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                Best Value
              </span>
            </div>

            <div className="text-center mb-8 pt-4">
              <h3 className="font-heading text-2xl font-bold text-foreground mb-2">AI-Ready Families Framework</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-primary">{priceLoading ? '...' : formattedPrice}</span>
              </div>
              <p className="text-sm text-secondary font-medium">Founding member price</p>
            </div>

            <div className="mb-8">
              <p className="font-medium text-foreground mb-4">What's included:</p>
              <ul className="space-y-3">
                {coreFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="cta" size="xl" className="w-full gap-2" onClick={handleCoreClick} disabled={!coreLink}>
              {coreLink ? 'Join as Founding Member' : 'Loading...'}
            </Button>

            {coreInstallmentsLink && (
              <>
                <div className="my-4 flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <Button variant="outline" size="lg" className="w-full" onClick={handleCoreInstallmentsClick}>
                  Pay in 3 Installments
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  3 monthly payments
                </p>
              </>
            )}

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Secure checkout
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                90-day guarantee
              </span>
            </div>
          </div>

          {/* Premium Offer */}
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 md:relative md:top-0 md:left-0 md:translate-x-0 mb-4">
              <span className="bg-muted text-muted-foreground px-4 py-1.5 rounded-full text-sm font-medium">
                Complete Package
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                + 1:1 Strategy Session
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-primary">{premiumPriceLoading ? '...' : formattedPremiumPrice}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="font-medium text-foreground mb-4">Everything in Core, PLUS:</p>
              <ul className="space-y-3">
                {premiumExtras.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="outline" size="xl" className="w-full gap-2" onClick={handlePremiumClick} disabled={!premiumLink}>
              {premiumLink ? 'Get Personalised Support' : 'Loading...'}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Secure checkout
              </span>
              <span>Limited availability</span>
            </div>
          </div>
        </div>

        {/* Urgency */}
        {!isSoldOut && (
          <div className="mt-12 text-center">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-secondary/10 text-secondary-foreground'}`}>
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">
                {isUrgent
                  ? `Only ${spots} founding member spots left — price increases when they're gone.`
                  : `Founding member pricing ends when we reach 100 families.`}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Pricing;
