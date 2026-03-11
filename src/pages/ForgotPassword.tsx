import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-recovery-email', {
        body: { email },
      });

      if (fnError) {
        toast.error('Something went wrong. Please try again.');
      } else {
        setSent(true);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-hero">
              <span className="font-heading text-xl font-bold text-primary-foreground">W</span>
            </div>
            <span className="font-heading text-2xl font-semibold text-foreground">WiseFamilies</span>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Check your email</h1>
              <p className="text-muted-foreground">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>. 
                Click the link in the email to reset your password.
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't receive an email? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="text-primary hover:underline">
                  try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">Reset your password</h1>
              <p className="text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`pl-10 ${error ? 'border-destructive' : ''}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <Button type="submit" variant="cta" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
