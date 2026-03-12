

## Send Welcome Email When Admin Creates a User

The `create-user` edge function already calls `generateLink({ type: "recovery" })` but that only generates the link — it doesn't send an email. The fix is to reuse the existing `send-recovery-email` pattern (Resend + branded HTML) but with a welcome-themed email instead of a "reset your password" email.

### Changes

**`supabase/functions/create-user/index.ts`**
- After creating the user, replace the current `generateLink` call with a full Resend-based email send (same pattern as `send-recovery-email`)
- Generate a recovery link via `auth.admin.generateLink({ type: "recovery", email, options: { redirectTo } })`
- Send a branded welcome email via Resend with subject like "Welcome to {courseName} — Set Your Password"
- Email copy explains they've been given course access and need to set a password to get started
- Same dark-mode-safe styling: white background, dark green header, golden CTA button
- Fetch `signup_reminder_from_email` and `course_name` from `course_settings` (same as recovery email)
- Add `deno.json` with Resend import (same as `send-recovery-email/deno.json`)

**New file: `supabase/functions/create-user/deno.json`**
- Import map for Resend: `{ "imports": { "resend": "npm:resend@2.0.0" } }`

### No new secrets needed
Uses existing `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_URL`.

