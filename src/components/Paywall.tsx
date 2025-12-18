import { useState } from 'react';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCoursePrice } from '@/hooks/useCoursePrice';

const Paywall = () => {
  const [loading, setLoading] = useState(false);
  const { formattedPrice, loading: priceLoading } = useCoursePrice();

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Lifetime access to all course modules',
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
        Unlock the Full Course
      </h2>
      
      <p className="mb-6 text-muted-foreground">
        Get lifetime access to the A.I - Ready Family Framework and all future updates.
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
        <div className="text-4xl font-bold text-foreground">
          {priceLoading ? '...' : formattedPrice}
        </div>
        <div className="text-sm text-muted-foreground">one-time payment</div>
      </div>

      <Button 
        variant="cta" 
        size="lg" 
        className="w-full gap-2" 
        onClick={handlePurchase}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          'Get Lifetime Access'
        )}
      </Button>

      <p className="mt-4 text-xs text-muted-foreground">
        Secure payment powered by Stripe. 30-day money-back guarantee.
      </p>
    </div>
  );
};

export default Paywall;
