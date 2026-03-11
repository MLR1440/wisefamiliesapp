import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasPaymentToken, setHasPaymentToken] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  // Check for payment token on mount — from localStorage or URL query param
  useEffect(() => {
    let token = localStorage.getItem('purchase_claim_token');

    // Fallback: check URL query params (e.g. from reminder email link)
    if (!token) {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        token = urlToken;
        localStorage.setItem('purchase_claim_token', urlToken);
      }
    }

    if (token) {
      setHasPaymentToken(true);
      // Pre-fill email from Stripe if available
      const storedEmail = localStorage.getItem('purchase_stripe_email');
      if (storedEmail) {
        setFormData(prev => ({ ...prev, email: storedEmail }));
      }
    } else {
      setHasPaymentToken(false);
    }
  }, []);

  // Redirect if already logged in - to dashboard (where paywall shows if not paid)
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Redirect to home if no payment token (must pay first)
  useEffect(() => {
    if (hasPaymentToken === false) {
      // Small delay to prevent flash
      const timeout = setTimeout(() => {
        navigate('/');
        toast.info('Please complete payment first to create an account.');
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [hasPaymentToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!agreed) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    // Validate form data
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setErrors({ email: 'This email is already registered. Please sign in instead.' });
        } else {
          toast.error(error.message || 'Failed to create account');
        }
      } else {
        toast.success('Account created successfully!');
        // PaymentSuccess page handles claiming the purchase
        navigate('/payment-success');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!agreed) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message || 'Failed to sign up with Google');
    }
    setIsGoogleLoading(false);
  };

  // Show loading while checking for token
  if (hasPaymentToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Will redirect if no token, but show message briefly
  if (!hasPaymentToken) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Payment Required</h1>
          <p className="text-muted-foreground">
            Please complete your purchase first to create an account.
          </p>
          <Link to="/#pricing">
            <Button size="lg">View Pricing</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Back link */}
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-hero">
                <span className="font-heading text-xl font-bold text-primary-foreground">W</span>
              </div>
              <span className="font-heading text-2xl font-semibold text-foreground">WiseFamilies</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">Create your account</h1>
            <p className="text-muted-foreground">Complete your registration to access the course</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Sarah"
                    className="pl-10"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Johnson"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This can be different from the email you used for payment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-tight text-muted-foreground">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button type="submit" variant="cta" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
              {isGoogleLoading ? 'Signing up...' : 'Continue with Google'}
            </Button>
          </form>

          {/* Sign in link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden bg-gradient-hero lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <h2 className="mb-4 font-heading text-3xl font-bold">Almost There!</h2>
          <p className="mb-6 text-lg text-primary-foreground/80">
            Complete your registration to join 200+ parents preparing their children for the AI age.
          </p>
          <div className="rounded-xl bg-primary-foreground/10 p-6 backdrop-blur-sm">
            <p className="italic text-primary-foreground/90">
              "This course changed how we talk about technology at home. My kids are now asking the right questions about AI!"
            </p>
            <p className="mt-4 font-medium">- Sarah M., Mother of 2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
