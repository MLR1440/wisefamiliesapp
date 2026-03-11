

## Fix Signup Reminder Function and Streamline Reminder Flow

### Problems Found

1. **`send-signup-reminder` has a duplicate variable declaration** (line 105 and 107: `const fromEmail` declared twice). This crashes the function — no reminder emails are being sent.

2. **Reminder flow shows two signup forms**: After submitting the form on `/signup`, the user is navigated to `/payment-success` which shows its own signup form. This is confusing, though functionally it works if auto-confirm is enabled since the auth state change triggers the claim before the user sees the second form.

### Changes

**1. Fix `supabase/functions/send-signup-reminder/index.ts`**
Remove the duplicate `const fromEmail` on line 107. Keep the one on line 105.

**2. Improve Signup.tsx post-submit redirect (optional but recommended)**
After successful signup from the reminder link flow, instead of navigating to `/payment-success` (which shows another signup form), the code should either:
- Show a "Check your email" message if email confirmation is required, OR
- Let the auth state change handle the redirect naturally (the `useEffect` watching `user` already redirects to `/dashboard`)

### Files Changed
- `supabase/functions/send-signup-reminder/index.ts` — remove duplicate variable
- `src/pages/Signup.tsx` — adjust post-signup navigation to avoid double form

