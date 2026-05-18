## Responsive Dashboard Spacing Tweaks

### Goal
Keep the dashboard visually identical to the current desktop layout when viewed on small screens (< 640px). Today, paddings, gaps, and the progress hero feel oversized on mobile because they use fixed (non-responsive) values.

### Changes (single file: `src/pages/Dashboard.tsx`)

1. **Main container** — tighten top/bottom padding on mobile.
   - `py-8 md:py-12` → `py-6 sm:py-8 md:py-12`.

2. **Welcome block** — reduce bottom margin on mobile.
   - `mb-8` → `mb-6 sm:mb-8`.

3. **Progress hero card** (`mb-6 ... p-6`)
   - Padding: `p-6` → `p-4 sm:p-6`.
   - Inner stack: `flex-col gap-6` → `flex-col gap-4 sm:gap-6`.
   - Center the ring on mobile: add `items-center` to mobile column (`flex-col items-center sm:items-start`).
   - Stats row: `gap-x-5 gap-y-2 mb-3` → `gap-x-4 gap-y-1.5 mb-3` and ensure it wraps cleanly (already does).
   - Continue row: `p-3` is fine; ensure Button stays `shrink-0` (already).

4. **Quick-access grid** — reduce gap and card padding on mobile, and bottom margin.
   - Grid: `mb-10 grid gap-4 md:grid-cols-3` → `mb-8 sm:mb-10 grid gap-3 sm:gap-4 md:grid-cols-3`.
   - Each of the three cards: `p-5` → `p-4 sm:p-5`.

5. **Course content section**
   - Heading: `mb-4` → `mb-3 sm:mb-4`.
   - Chapter list: `space-y-3` → `space-y-2.5 sm:space-y-3`.
   - Chapter header button: `p-4` → `p-3 sm:p-4`.
   - Chapter expanded content: `px-4 pb-4` → `px-3 pb-3 sm:px-4 sm:pb-4`.
   - Module row: `p-3` → `p-2.5 sm:p-3`, icon size stays 8×8.

6. **Welcome heading** size — already `text-2xl`; leave as-is (matches screenshot).

### Out of Scope
- No color, copy, layout-structure, or business-logic changes.
- No new components or dependencies.

### Verification
- After edit, view preview at 375px and 986px viewports and confirm parity with the approved screenshot layout.
