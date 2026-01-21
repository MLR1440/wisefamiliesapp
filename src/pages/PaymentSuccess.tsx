import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { refreshPaymentStatus, checkingPayment, hasAccess, user } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Refresh payment status when landing on this page
    refreshPaymentStatus();
    
    // Check onboarding status
    const checkOnboarding = async () => {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }
      
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setOnboardingCompleted(data?.onboarding_completed ?? false);
      } catch (err) {
        console.error('Error checking onboarding:', err);
      } finally {
        setCheckingOnboarding(false);
      }
    };
    
    checkOnboarding();
  }, [user]);

  const handleContinue = () => {
    // If onboarding not completed, go to onboarding first
    if (!onboardingCompleted) {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  };

  const isLoading = checkingPayment || checkingOnboarding;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground">Payment Successful!</h1>
        
        <p className="text-muted-foreground">
          Thank you for your purchase! You now have access to the WiseFamilies course. Check your email for details about your subscription.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying your purchase...</span>
          </div>
        ) : hasAccess ? (
          <Button onClick={handleContinue} size="lg" className="w-full">
            {onboardingCompleted ? 'Start Learning' : 'Continue Setup'}
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If your access isn't showing yet, please wait a moment and try refreshing.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={refreshPaymentStatus} className="flex-1">
                Refresh Status
              </Button>
              <Button onClick={() => navigate('/dashboard')} className="flex-1">
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
