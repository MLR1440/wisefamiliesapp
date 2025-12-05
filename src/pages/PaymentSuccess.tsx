import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { refreshPaymentStatus, checkingPayment, hasAccess } = useAuth();

  useEffect(() => {
    // Refresh payment status when landing on this page
    refreshPaymentStatus();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground">Payment Successful!</h1>
        
        <p className="text-muted-foreground">
          Thank you for your purchase! You now have lifetime access to the WiseFamilies course.
        </p>

        {checkingPayment ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying your purchase...</span>
          </div>
        ) : hasAccess ? (
          <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full">
            Start Learning
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
