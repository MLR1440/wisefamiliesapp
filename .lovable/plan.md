

## Kit.com Integration for Recovered Purchases + Signup Reminder Emails

### Overview
This plan addresses two related issues:
1. **Kit.com Gap**: Customers who recover their purchase via `check-payment` (after signing up later) are NOT added to your email list
2. **Abandoned Signups**: Customers who pay but don't create an account within a timeframe don't receive any reminder to complete signup

### Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CURRENT FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Payment → verify-stripe-session → pending_purchases → signup               │
│                                                        ↓                    │
│                                                  claim-purchase             │
│                                                        ↓                    │
│                                                   Kit.com ✓                 │
│                                                                             │
│  Payment → (exit) → signup later → check-payment                            │
│                                          ↓                                  │
│                                     user_purchases                          │
│                                          ↓                                  │
│                                     Kit.com ✗ ← MISSING!                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEW FLOW                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Payment → verify-stripe-session → pending_purchases → signup               │
│                ↓                        ↓              ↓                    │
│         Kit.com ✓ (immediate)    24h later         claim-purchase           │
│                                        ↓              ↓                     │
│                             send-signup-reminder    Kit.com ✓ (form)        │
│                                        ↓                                    │
│                               Reminder Email                                │
│                                                                             │
│  Payment → (exit) → signup later → check-payment                            │
│                                          ↓                                  │
│                                     user_purchases                          │
│                                          ↓                                  │
│                                     Kit.com ✓ ← FIXED!                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Part 1: Add Kit.com to check-payment Function

When `check-payment` discovers a purchase in Stripe and creates a `user_purchases` record, it will ALSO add the user to Kit.com using the same logic as `claim-purchase`.

**Changes to `check-payment/index.ts`:**
- After successfully recording a new purchase (lines 193-208), call Kit.com API
- Fetch email marketing settings from `course_settings`
- Look up the `price_id` from the Stripe session to determine which form to use
- Create/update subscriber and add to the appropriate form

### Part 2: Add Kit.com Immediately After Payment Verification

For better reliability, add customers to Kit.com immediately when their payment is verified (before they even sign up). This ensures they're on your list regardless of what happens next.

**Changes to `verify-stripe-session/index.ts`:**
- After storing the pending purchase, add customer to Kit.com
- Use the same two-step process (create subscriber → add to form)
- This happens with their Stripe checkout email

**Note:** The `claim-purchase` function will still run its Kit.com logic when they sign up, but Kit.com handles duplicates gracefully.

### Part 3: Signup Reminder Email System

Create a new edge function that runs on a schedule to find customers who paid but haven't signed up, and sends them a reminder email.

**New Files:**
| File | Purpose |
|------|---------|
| `supabase/functions/send-signup-reminder/index.ts` | Scheduled function to send reminder emails |

**Database Changes:**
- Add `reminder_sent_at` column to `pending_purchases` to track if reminder was sent
- This prevents duplicate reminder emails

**How It Works:**
1. Scheduled to run every hour via pg_cron
2. Queries `pending_purchases` for records where:
   - `claimed_by` IS NULL (not yet signed up)
   - `created_at` > 24 hours ago (give them time to finish)
   - `reminder_sent_at` IS NULL (haven't sent reminder yet)
   - Has `stripe_customer_email`
3. Sends reminder email via Resend API
4. Updates `reminder_sent_at` to prevent duplicates

### File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/check-payment/index.ts` | Update | Add Kit.com integration when recovering purchases from Stripe |
| `supabase/functions/verify-stripe-session/index.ts` | Update | Add immediate Kit.com subscription after payment verification |
| `supabase/functions/send-signup-reminder/index.ts` | Create | New scheduled function for reminder emails |
| `supabase/config.toml` | Update | Add config for new edge function |
| Database migration | Create | Add `reminder_sent_at` column to `pending_purchases` |

### Email Reminder Content

The reminder email will include:
- Friendly reminder that they purchased but haven't created their account
- Direct link to `/signup` (the claim token may have expired, but `check-payment` will handle recovery)
- Your branding/support contact

### Required Secrets

For the signup reminder emails, you'll need to add:
- `RESEND_API_KEY` - For sending emails via Resend.com

You already have `KIT_API_KEY` and `KIT_FORM_ID` configured.

### Admin Settings (Optional Enhancement)

Could add to Admin Settings:
- Toggle to enable/disable signup reminder emails
- Customize the reminder email subject/content
- Set the delay before sending reminder (default 24 hours)

### What You'll Need To Do

1. **Approve this plan**
2. **Sign up for Resend.com** if you haven't already
3. **Verify your email domain** at https://resend.com/domains
4. **Create an API key** at https://resend.com/api-keys
5. **Provide the `RESEND_API_KEY`** when prompted after implementation
6. After deployment, reminders will be sent automatically to customers who don't complete signup within 24 hours

