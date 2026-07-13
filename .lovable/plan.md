# Fix Installment Plan — Cap at 3 Payments

Stripe Prices are **immutable** once created — that's why the billing period field is greyed out. You can't edit an existing price; you have to create a new one with the 3-payment cap, then swap the Payment Link to use it.

## What we'll do

### 1. Create a new capped installment Price in Stripe
- Duplicate the existing "Core – Installments" price.
- On the new price, set **"Cancel subscription after a specific number of payments" = 3** (API field: `iterations: 3` on the schedule).
- Same amount, same currency, same interval as today.
- I can do this for you via the Stripe tools — just confirm the amount and interval (e.g. $46.33 AUD / month × 3).

### 2. Create a new Payment Link using the new price
- Payment Links snapshot the price at creation time, so the existing link will keep using the old uncapped price forever. A new link is required.
- Same success URL as the current installments link (points to `/payment-success` on your app).

### 3. Update the app to use the new Payment Link
- The link is stored in `course_settings` under key `payment_link_core_installments` and served by the `get-payment-links` edge function.
- Update that single row to the new URL. No frontend code changes needed — `usePaymentLinks` will pick it up automatically.
- Archive the old price and old Payment Link in Stripe so nobody can hit them again.

### 4. Fix customers who were already over-charged
For each affected customer we need to:
- **Cancel** the active subscription (`sub_...`) so no further charges occur.
- **Refund** any charges beyond payment #3.

I'll need from you either:
- The customer emails / `sub_...` / `pi_...` IDs, **or**
- Permission to search Stripe for all active subscriptions on the current installments price and list them back to you for approval before refunding/cancelling.

Refunds and cancellations require your explicit approval per action.

## Technical details

- **Files touched:** none in the codebase. Only Stripe (new price, new payment link, archive old ones) + one row in `course_settings.payment_link_core_installments`.
- **Why no webhook route:** Setting `iterations: 3` on the price's schedule makes Stripe auto-cancel the subscription after the 3rd successful invoice. No app-side webhook needed, and this behaves correctly for all future customers.
- **Existing customers are not retroactively capped** — the `iterations` value is copied onto the subscription at creation time. That's why step 4 is manual cleanup.

## What I need from you to proceed

1. Confirm the installment amount + interval (so I create the new price correctly).
2. Say whether I should search Stripe for currently-active installment subscribers, or you'll supply the list.
