

# Plan: Reset Counter & Add Counter Bar to Hero

## Changes

### 1. Mark Test Purchases as Refunded
Run a data update to set `refunded = true` on all 7 existing test purchases. This will make the `get_founding_spots_remaining()` function return 100 (since it only counts non-refunded purchases). No schema change needed — this is a data operation.

Since we can't use the migration tool for data updates, we'll use a database migration that updates the existing rows:

```sql
UPDATE public.user_purchases SET refunded = true WHERE purchased_at < '2026-03-11';
```

### 2. Add Founding Spots Counter to Hero Section
Update `src/components/landing/Hero.tsx` to:
- Import `useFoundingSpots` and `Progress` component
- Replace the static "Join the first 100 founding families" text at the bottom with a live counter + progress bar
- Place it prominently above the fold, after the CTA button and before the video

The counter will match the same visual style used in Pricing.tsx (progress bar + spots remaining text).

### Files Modified
- `src/components/landing/Hero.tsx` — add counter bar with progress indicator
- One database migration — mark test purchases as refunded

