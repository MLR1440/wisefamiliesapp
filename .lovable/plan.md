

# Plan: Fix Kit.com API Authentication Header

## Summary
The quiz's Kit.com integration is failing because the Edge Function is using the wrong authentication header format. Kit.com's V4 API requires `X-Kit-Api-Key` header, not `Authorization: Bearer`.

## What's Happening Now
- Quiz saves to database: Working
- Kit.com sync: Failing with "The access token is invalid"
- Root cause: Wrong header format being sent to Kit API

## The Fix

Update the `submit-quiz` Edge Function to use the correct Kit.com V4 authentication header.

### Current (Incorrect)
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${kitApiKey}`,
}
```

### Fixed (Correct)
```javascript
headers: {
  'Content-Type': 'application/json',
  'X-Kit-Api-Key': kitApiKey,
}
```

## Files to Update

### 1. supabase/functions/submit-quiz/index.ts
- Change line 101-102: Replace `'Authorization': Bearer ${kitApiKey}` with `'X-Kit-Api-Key': kitApiKey`
- Change line 119-120: Same header fix for the form subscription call

### 2. Other Edge Functions (for consistency)
Check and fix the same issue in other functions that use Kit.com:
- `supabase/functions/claim-purchase/index.ts`
- `supabase/functions/verify-stripe-session/index.ts`
- `supabase/functions/check-payment/index.ts`

## Technical Details

| File | Line Numbers | Change |
|------|-------------|--------|
| submit-quiz/index.ts | 100-102 | Change Authorization header to X-Kit-Api-Key |
| submit-quiz/index.ts | 118-120 | Change Authorization header to X-Kit-Api-Key |
| Other Kit-using functions | Various | Same header change pattern |

## Verification Steps
After the fix is deployed:
1. Complete the quiz with a test email
2. Check the database for the new lead
3. Verify `kit_subscriber_id` is populated (not null)
4. Check Kit.com dashboard to confirm the subscriber appears with tags

