import { Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaymentLinks } from '@/hooks/usePaymentLinks';
import { useFoundingSpots } from '@/hooks/useFoundingSpots';
import { useCoursePrice } from '@/hooks/useCoursePrice';
import { Link } from 'react-router-dom';

const Paywall = () => {
  const { coreLink, coreInstallmentsLink, loading } = usePaymentLinks();
  const { spots, isUrgent, isSoldOut } = useFoundingSpots();
  const { formattedPrice, loading: priceLoading } = useCoursePrice();

  const handlePurchase = () => {
    if (coreLink) window.open(coreLink, '_blank', 'noopener,noreferrer');
  };

  const handleInstallmentsClick = () => {
    if (coreInstallmentsLink) window.open(coreInstallmentsLink, '_blank', 'noopener,noreferrer');
  };

  const benefits = [
    '12-month access to all course modules',
    'AI-powered coaching conversations',
    'Progress tracking and achievements',
    'New content as it becomes available',
  ];

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-8 text-center shadow-soft">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Lock className="h-8 w-8 text-primary" />
      </div>

      <h2 className="mb-2 font-heading text-2xl font-bold text-foreground">
        Unlock the Full Framework
      </h2>

      <p className="mb-6 text-muted-foreground">
        Get 12-month access to the A.I-Ready Family Framework and all future updates.
      </p>

      <div className="mb-6 space-y-3 text-left">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-foreground">{benefit}</span>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="text-4xl font-bold text-foreground">$139 AUD</div>
        <div className="text-sm text-muted-foreground">one-time payment</div>
        {!isSoldOut && (
          <div className={`mt-2 text-sm font-medium ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
            {spots} founding member spots remaining
          </div>
        )}
      </div>

      {coreLink ? (
        <Button
          variant="cta"
          size="lg"
          className="w-full gap-2"
          onClick={handlePurchase}
          disabled={loading}
        >
          Get 12-Month Access
        </Button>
      ) : (
        <Link to="/signup" className="block">
          <Button variant="cta" size="lg" className="w-full gap-2">
            Get 12-Month Access
          </Button>
        </Link>
      )}

      {coreInstallmentsLink && (
        <button
          onClick={handleInstallmentsClick}
          className="mt-3 text-sm text-primary hover:underline"
        >
          or pay in 3 installments of $47
        </button>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Secure payment powered by Stripe. 90-day money-back guarantee.
      </p>
    </div>
  );
};

export default Paywall;
