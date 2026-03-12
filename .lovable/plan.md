

## Fix: Allow Subscription-Mode Payments in Verification

### Problem
The installment/payment plan checkout creates a Stripe session with `mode: "subscription"` (this is how Stripe handles installment plans). The `verify-stripe-session` edge function has a hard check that rejects any session where `mode !== "payment"`, causing the "Payment Verification Failed" error.

### Solution
Update `supabase/functions/verify-stripe-session/index.ts` to also accept `mode: "subscription"` sessions. For subscriptions, check that the subscription status is active rather than just checking `payment_status === "paid"`.

### Changes
**`supabase/functions/verify-stripe-session/index.ts`**
- Remove the strict `mode === "payment"` check — allow both `"payment"` and `"subscription"`
- For subscription mode, verify the session has an active subscription (Stripe sets `payment_status` to `"paid"` for successful subscription starts too, so the existing check works)
- Keep all other logic (product verification, pending_purchases, Kit.com integration) unchanged

