

## Fix Bug 3 (Dynamic Premium Price) and Bug 7 (Age Range)

### Bug 7 — Age Range (Simple text fix)
Change "8-14" to "8-16" in `src/components/landing/CourseContent.tsx` line 11.

### Bug 3 — Dynamic Premium Pricing

**Goal:** Replace the hardcoded "Contact Us AUD" in the Premium pricing card with the actual $991 AUD price fetched from Stripe.

**Approach:** Create a new edge function `get-premium-price` (similar to `get-price`) that fetches the premium price from Stripe using a stored `stripe_price_id_premium` setting, with fallback to the known premium price ID.

**Changes:**

1. **Database** — Insert a new `course_settings` row: `key = 'stripe_price_id_premium'`, `value = 'price_1Sruz7QLJHCz1zk9mP44mTPT'`

2. **RLS whitelist update** — Add `'stripe_price_id_premium'` to the public-safe settings list so the landing page can read it

3. **Edge function** — Create `supabase/functions/get-premium-price/index.ts` that:
   - Reads `stripe_price_id_premium` from `course_settings` (via service role)
   - Fetches the price from Stripe API
   - Returns `{ amount, currency }`
   - Falls back to `{ amount: 991, currency: 'aud' }` on error

4. **New hook** — Create `src/hooks/usePremiumPrice.ts` (mirrors `useCoursePrice.ts`) that calls `get-premium-price` and formats the price

5. **Update `Pricing.tsx`** — Replace the hardcoded "Contact Us" / "AUD" spans with the formatted premium price from the new hook

6. **Admin Settings** — Add the premium price ID field to admin settings so it can be updated (store as `stripe_price_id_premium` key, same pattern as existing `stripe_price_id`)

### Result
- Premium card shows "$991.00 AUD" dynamically from Stripe
- Age range consistently says "8-16" across the landing page
- Admin can update the premium price ID from settings if it changes

