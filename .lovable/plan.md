

## Fix Signup Reminder Email Link

### Problem
The reminder email links to `/signup` with no claim token. Since the customer closed their browser, `localStorage` is empty, and the signup page blocks them with "Payment Required." Additionally, the claim token has a 1-hour expiry but reminders are sent 24+ hours later.

### Changes

**1. Update `send-signup-reminder` function**
- Select `claim_token` from the `pending_purchases` query
- Reset the token expiry before sending (extend to 72 hours from now)
- Include the token in the email URL: `/signup?token={claim_token}`

**2. Update `src/pages/Signup.tsx`**
- Check URL query params for `?token=xxx` as a fallback when `localStorage` has no token
- If found, store it in `localStorage` so the rest of the flow works unchanged

**3. Remove the 1-hour default expiry concern**
- When the reminder function sends an email, update `expires_at` to `NOW() + 72 hours` so the token is valid when the customer clicks the link

### Files Changed
- `supabase/functions/send-signup-reminder/index.ts` — include token in URL, extend expiry
- `src/pages/Signup.tsx` — read token from URL query params as fallback

