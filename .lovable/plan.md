

## Custom Password Reset Email via Resend

Since you already have Resend configured with `RESEND_API_KEY` and a verified sender domain, we can create a custom password reset email edge function that sends a dark-mode-safe, branded email — matching your existing signup reminder style.

### Approach

Instead of relying on the default system password reset email (which has the invisible button in dark mode), we'll:

1. **Create a new edge function `send-recovery-email`** that:
   - Receives the user's email address
   - Generates a recovery link using Supabase Admin API (`generateLink` with type `recovery`)
   - Sends a branded HTML email via Resend with dark-mode-safe inline styles
   - Uses the same `signup_reminder_from_email` setting as your existing reminder emails

2. **Update `ForgotPassword.tsx`** to call the new edge function instead of `supabase.auth.resetPasswordForEmail()` — this bypasses the default system email entirely

3. **Email design** — Matches your WiseFamilies brand:
   - Dark green header (#003400), golden CTA button (#f2ba3f on #003400)
   - White email body background for dark mode compatibility
   - Explicit `color` on all text elements so nothing becomes invisible
   - Same font stack and tone as your signup reminder emails

### Files Changed
- **New:** `supabase/functions/send-recovery-email/index.ts` — Generates recovery link via admin API, sends branded email via Resend
- **New:** `supabase/functions/send-recovery-email/deno.json` — Resend import map
- **Edit:** `supabase/config.toml` — Add function config
- **Edit:** `src/pages/ForgotPassword.tsx` — Call new edge function instead of default `resetPasswordForEmail`

### No new secrets needed
Uses existing `RESEND_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`.

