

# Plan: Live Founding Member Spots Counter

## Approach
Track the number of purchases in the database and display a live "spots remaining" counter on the landing page. The count is derived from the `user_purchases` table (non-refunded purchases).

## Changes

### 1. Database Migration
Create a database function that counts remaining spots. This avoids exposing the `user_purchases` table publicly.

```sql
CREATE OR REPLACE FUNCTION public.get_founding_spots_remaining()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT GREATEST(0, 100 - COUNT(*)::integer)
  FROM public.user_purchases
  WHERE refunded = false;
$$;
```

Grant anonymous access so the landing page can call it without auth:
```sql
GRANT EXECUTE ON FUNCTION public.get_founding_spots_remaining() TO anon, authenticated;
```

### 2. New Hook: `useFoundingSpots`
Simple hook that calls the RPC function and returns the remaining count. Uses react-query with a reasonable stale time (1 minute).

### 3. Update Pricing.tsx
- Replace the static "First 100 Families Only" text with the live counter (e.g., "Only 73 spots remaining at founding member pricing")
- Replace the bottom urgency banner with the live count
- Add a progress bar showing how many spots are taken (visual urgency)

### 4. Update CTA.tsx
- Add a small line showing remaining spots near the "Join the Founding 100" button

### 5. Update Paywall.tsx
- Show remaining spots to reinforce urgency for logged-in users who haven't purchased

## Visual Treatment
The counter will show as a bold number with supporting text. When spots are low (under 20), the styling will shift to a more urgent color. When spots hit 0, the section will show "Founding member pricing has ended" (though pricing logic itself doesn't change -- that's a separate concern).

## Files Modified
- One database migration (new function)
- New: `src/hooks/useFoundingSpots.ts`
- Modified: `src/components/landing/Pricing.tsx`
- Modified: `src/components/landing/CTA.tsx`
- Modified: `src/components/Paywall.tsx`

