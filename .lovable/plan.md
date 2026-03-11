

## Fix Wrong Prices

The prices are wrong because the `stripe_price_id` stored in `course_settings` is `price_1SrXRDQLJHCz1zk9gH0xsfjk` (an old/invalid price ID). The correct live-mode price ID is `price_1SruuTQLJHCz1zk99ELRpWtl` ($139 AUD).

When the `get-price` edge function tries to look up that invalid price in Stripe, it fails and falls back to a hardcoded `$99 USD` — which is also wrong.

### Changes

**1. Update `stripe_price_id` in the database**
- Update `course_settings` row where `key = 'stripe_price_id'` to value `price_1SruuTQLJHCz1zk99ELRpWtl`

**2. Fix edge function fallbacks — `supabase/functions/get-price/index.ts`**
- Change the hardcoded fallback price ID from `price_1SaqpSQLJHCz1zk9H6YyndT4` to `price_1SruuTQLJHCz1zk99ELRpWtl`
- Change the error fallback from `amount: 99, currency: "usd"` to `amount: 139, currency: "aud"`

**3. Fix `src/hooks/useCoursePrice.ts` fallback** (if not already done)
- Ensure fallback is `{ amount: 139, currency: 'aud' }` throughout

These three changes will ensure the correct $139 AUD price displays everywhere.

