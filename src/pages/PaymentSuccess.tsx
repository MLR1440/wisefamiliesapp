import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshPaymentStatus, checkingPayment, hasAccess } = useAuth();
  
  // Verification state
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [stripeEmail, setStripeEmail] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  
  // Signup form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Check onboarding state for existing users
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Verify the Stripe session on mount
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    // Check localStorage for existing token (page refresh scenario)
    const storedToken = localStorage.getItem('purchase_claim_token');
    const storedEmail = localStorage.getItem('purchase_stripe_email');
    
    if (storedToken) {
      setClaimToken(storedToken);
      setStripeEmail(storedEmail);
      if (storedEmail) setEmail(storedEmail);
      setVerified(true);
      setVerifying(false);
      return;
    }
    
    if (!sessionId) {
      setVerifyError('No payment session found. Please complete payment first.');
      setVerifying(false);
      return;
    }
    
    const verifySession = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-stripe-session', {
          body: { session_id: sessionId }
        });
        
        if (error || !data?.valid) {
          setVerifyError(data?.error || error?.message || 'Could not verify payment');
          return;
        }
        
        // Store token for page refresh
        localStorage.setItem('purchase_claim_token', data.token);
        if (data.email) {
          localStorage.setItem('purchase_stripe_email', data.email);
          setEmail(data.email);
        }
        
        setClaimToken(data.token);
        setStripeEmail(data.email);
        setVerified(true);
      } catch (err) {
        setVerifyError('An error occurred while verifying payment');
        console.error(err);
      } finally {
        setVerifying(false);
      }
    };
    
    verifySession();
  }, [searchParams]);
  
  // If user is already logged in, claim purchase and redirect
  useEffect(() => {
    if (user && claimToken && verified) {
      claimPurchaseAndRedirect();
    }
  }, [user, claimToken, verified]);
  
  const claimPurchaseAndRedirect = async () => {
    if (!claimToken) return;
    
    setCheckingOnboarding(true);
    
    try {
      // Claim the purchase
      const { data, error } = await supabase.functions.invoke('claim-purchase', {
        body: { token: claimToken }
      });
      
      if (error) {
        console.error('Error claiming purchase:', error);
        // Don't block - might already be claimed
      }
      
      // Clear stored tokens
      localStorage.removeItem('purchase_claim_token');
      localStorage.removeItem('purchase_stripe_email');
      
      // Refresh payment status
      await refreshPaymentStatus();
      
      // Check onboarding status
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setOnboardingCompleted(profile?.onboarding_completed ?? false);
        
        // Navigate based on onboarding status
        if (profile?.onboarding_completed) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (err) {
      console.error('Error in claim flow:', err);
    } finally {
      setCheckingOnboarding(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    if (!agreed) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    const result = signupSchema.safeParse({ firstName, lastName, email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Sign up the user
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast.error('This email is already registered. Please log in instead.');
          setFormErrors({ email: 'Already registered - please log in' });
        } else {
          toast.error(signUpError.message);
        }
        return;
      }
      
      toast.success('Account created! Setting up your access...');
      
      // The useEffect watching `user` will handle claiming and redirect
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignUp = async () => {
    if (!agreed) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    // Store claim token before OAuth redirect
    if (claimToken) {
      localStorage.setItem('purchase_claim_token', claimToken);
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/payment-success`,
      },
    });
    
    if (error) {
      toast.error(error.message);
    }
  };

  // Loading state while verifying
  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (verifyError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Payment Verification Failed</h1>
          <p className="text-muted-foreground">{verifyError}</p>
          <Link to="/">
            <Button variant="outline" size="lg">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Already logged in - claiming purchase
  if (user && (checkingPayment || checkingOnboarding)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Setting up your access...</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Logged in with access - redirect
  if (user && hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">You're All Set!</h1>
          <p className="text-muted-foreground">
            You have access to the course. Let's get started!
          </p>
          <Button onClick={() => navigate(onboardingCompleted ? '/dashboard' : '/onboarding')} size="lg" className="w-full">
            {onboardingCompleted ? 'Go to Dashboard' : 'Continue Setup'}
          </Button>
        </div>
      </div>
    );
  }

  // Main signup form for new users after payment
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
          <p className="text-muted-foreground mt-2">
            Create your account to access the course
          </p>
        </div>
        
        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={formErrors.firstName ? 'border-destructive' : ''}
              />
              {formErrors.firstName && (
                <p className="text-sm text-destructive">{formErrors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={formErrors.lastName ? 'border-destructive' : ''}
              />
              {formErrors.lastName && (
                <p className="text-sm text-destructive">{formErrors.lastName}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={formErrors.email ? 'border-destructive' : ''}
            />
            {formErrors.email && (
              <p className="text-sm text-destructive">{formErrors.email}</p>
            )}
            {stripeEmail && stripeEmail !== email && (
              <p className="text-sm text-muted-foreground">
                Note: This can be different from your payment email ({stripeEmail})
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={formErrors.password ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-sm text-destructive">{formErrors.password}</p>
            )}
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              I agree to the{' '}
              <a href="https://wisefamilies.co/terms-of-use/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="https://wisefamilies.co/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>
            </Label>
          </div>
          
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
        
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        {/* Google Sign Up */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleGoogleSignUp}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
        
        {/* Already have account */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
