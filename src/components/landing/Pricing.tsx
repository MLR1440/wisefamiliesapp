import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Shield, Lock, Zap, Star } from 'lucide-react';
import { usePaymentLinks } from '@/hooks/usePaymentLinks';

const coreFeatures = [
  "12-month course access",
  "Complete 7-chapter video course",
  "AI-powered coaching tools",
  "Custom Family Tech Agreement builder",
  "Conversation script generator",
  "Private parent community (12 months)",
  "Downloadable resources & frameworks",
  "90-day money-back guarantee",
];

const premiumExtras = [
  "36-month course access (3 years)",
  "1-hour private video consultation with a qualified child psychologist",
  "Personalised assessment of your child's AI use",
  "Custom action plan designed specifically for your family",
  "Priority community support",
  "Extended community access (36 months)",
];

const Pricing = () => {
  const { coreLink, premiumLink } = usePaymentLinks();

  const handleCoreClick = () => {
    if (coreLink) {
      window.open(coreLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePremiumClick = () => {
    if (premiumLink) {
      window.open(premiumLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Path
          </h2>
          <p className="text-lg text-muted-foreground">
            Founding Member Pricing — First 100 Families Only
          </p>
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
              <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                AI-Ready Families System
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-primary">$139</span>
                <span className="text-muted-foreground ml-1">AUD</span>
              </div>
              <p className="text-sm text-secondary font-medium">60% OFF founding member price</p>
              <p className="text-sm text-muted-foreground line-through">Regular price: $347</p>
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

            {coreLink ? (
              <Button variant="cta" size="xl" className="w-full gap-2" onClick={handleCoreClick}>
                Join as Founding Member
              </Button>
            ) : (
              <Link to="/signup" className="block">
                <Button variant="cta" size="xl" className="w-full gap-2">
                  Join as Founding Member
                </Button>
              </Link>
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
                <span className="text-4xl font-bold text-primary">$991</span>
                <span className="text-muted-foreground ml-1">AUD</span>
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

            {premiumLink ? (
              <Button variant="outline" size="xl" className="w-full gap-2" onClick={handlePremiumClick}>
                Get Personalised Support
              </Button>
            ) : (
              <Link to="/signup" className="block">
                <Button variant="outline" size="xl" className="w-full gap-2">
                  Get Personalised Support
                </Button>
              </Link>
            )}

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
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary-foreground px-6 py-3 rounded-full">
            <Zap className="h-5 w-5 text-secondary" />
            <span className="text-sm font-medium">
              Founding member pricing ends when we reach 100 families. After that, the price increases to $347 AUD.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
