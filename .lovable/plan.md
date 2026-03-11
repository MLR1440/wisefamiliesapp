

## Bug: Reminder Flow Never Claims the Purchase

### Problem
When a customer signs up via the reminder email link (`/signup?token=xxx`), the signup form creates their account but **never calls `claim-purchase`** to link the payment to their account. The claim logic only exists in `PaymentSuccess.tsx`, not in `Signup.tsx`.

Result: The customer creates an account, verifies their email, logs in, and hits the Paywall because their purchase was never linked.

### Normal Flow (Working)
`/payment-success` → signup form → auth state change → `claimPurchaseAndRedirect()` → `claim-purchase` called → purchase linked → `/onboarding`

### Reminder Flow (Broken)
`/signup?token=xxx` → signup form → toast "check email" → user verifies → logs in → `/dashboard` → **Paywall** (no purchase record)

### Fix

**Add claim logic to `Signup.tsx`** — after the user signs up and is authenticated, check for a stored `purchase_claim_token` in localStorage and call `claim-purchase` before redirecting.

Specifically, update the `useEffect` that watches `user` (line 62-66) to:
1. Check if `purchase_claim_token` exists in localStorage
2. If so, call `claim-purchase` with that token
3. Clear the token from localStorage
4. Then navigate to `/onboarding` (not `/dashboard`, since this is a new user)

### Files Changed
- `src/pages/Signup.tsx` — add purchase claiming logic when user becomes authenticated

### Technical Detail
```text
Current (line 62-66):
  useEffect → if user → navigate('/dashboard')

Proposed:
  useEffect → if user → check localStorage for claim token
    → if token: invoke 'claim-purchase', clear tokens, navigate('/onboarding')
    → else: navigate('/dashboard')
```

