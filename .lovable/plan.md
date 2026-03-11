

## Fix: Mobile Video Player Pulsing / Won't Play

### Root Cause
In `VideoPlayer.tsx`, the loading overlay (`animate-pulse` div) is positioned with `absolute inset-0` and rendered as a sibling to the iframe. Without z-index management, it can block touch events on the iframe underneath. If `onLoad` doesn't fire (common on mobile/embedded contexts), the overlay stays forever.

### Fix (in `VideoPlayer.tsx`)

1. **Add z-index layering** — Give the iframe `relative z-10` so it always sits above the loading overlay, ensuring taps reach it even while loading
2. **Add a fallback timeout** — After 5 seconds, force `isLoading = false` so the overlay disappears regardless of whether `onLoad` fires
3. **Make overlay non-interactive** — Add `pointer-events-none` to the loading overlay so it can never block clicks/taps

### Changes
- **File:** `src/components/module/VideoPlayer.tsx`
  - Add `useEffect` with a 5-second timeout to set `isLoading = false` (reset on videoUrl change)
  - Add `pointer-events-none` to both loading overlay divs (lines 100, 121)
  - Add `relative z-10` to all iframe elements so they sit above the overlay

### Also fix: Double border wrapper
- **File:** `src/pages/ModulePage.tsx` (line 271)
  - Remove the extra wrapping div's border/rounded styles since `VideoPlayer` already has its own — this causes a double-border visual issue on mobile

