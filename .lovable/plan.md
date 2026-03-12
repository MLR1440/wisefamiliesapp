

## Plan: Configurable Founding Spots Limit + Social Media Links in Footer

### 1. Configurable Founding Spots Limit

Currently the number `100` is hardcoded in:
- The database function `get_founding_spots_remaining()` 
- `useFoundingSpots.ts` (fallback and math)
- `Hero.tsx`, `Pricing.tsx`, `CTA.tsx` (display text)

**Changes:**

**Database migration** -- Update `get_founding_spots_remaining()` to read from `course_settings` table instead of hardcoding 100:
```sql
CREATE OR REPLACE FUNCTION public.get_founding_spots_remaining()
  RETURNS integer
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT GREATEST(0, 
    COALESCE(
      (SELECT value::integer FROM public.course_settings WHERE key = 'founding_spots_limit'),
      100
    ) - COUNT(*)::integer
  )
  FROM public.user_purchases WHERE refunded = false;
$$;
```

**`src/hooks/useFoundingSpots.ts`** -- Add a query to fetch `founding_spots_limit` from `course_settings`, use it instead of hardcoded 100 for `spotsTaken` calculation and fallback.

**`src/components/landing/Hero.tsx`**, **`Pricing.tsx`**, **`CTA.tsx`** -- Replace hardcoded "100" references with the dynamic `totalSpots` value from the hook. Update "Join the Founding 100" button text to use dynamic value.

**`src/pages/admin/AdminSettings.tsx`** -- Add a "Founding Spots Limit" field in the Course Settings section. Simple number input, saved as `founding_spots_limit`.

**RLS** -- Add `founding_spots_limit` to the public-read whitelist so the landing page can read it.

### 2. Social Media Links in Footer

**`src/components/layout/Footer.tsx`** -- Add a "Follow Us" column with icon links for TikTok, Instagram, Facebook, and YouTube. Use simple SVG icons (lucide has `Instagram`, `Facebook`, `Youtube`; for TikTok use a small inline SVG). Links are hardcoded since they're unlikely to change frequently.

Social links:
- TikTok: `https://www.tiktok.com/@wisefamilies`
- Instagram: `https://www.instagram.com/wisefamilies.co/`
- Facebook: `https://www.facebook.com/wisefamilies.co`
- YouTube: `https://www.youtube.com/@WiseFamilies-ai`

### Files Changed
- `src/hooks/useFoundingSpots.ts` -- fetch and expose `totalSpots`
- `src/components/landing/Hero.tsx` -- use dynamic total
- `src/components/landing/Pricing.tsx` -- use dynamic total
- `src/components/landing/CTA.tsx` -- use dynamic total
- `src/pages/admin/AdminSettings.tsx` -- add founding spots limit field
- `src/components/layout/Footer.tsx` -- add social media icons
- DB migration: update RPC + RLS whitelist

