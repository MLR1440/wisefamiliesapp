

## Full App Bug Scan — Round 3 Findings

### Bug 1: Hardcoded prices throughout Pricing and CTA components
**Severity: Medium**
**Files:** `src/components/landing/Pricing.tsx` (lines 67-68, 71, 101, 131, 169-170), `src/components/landing/CTA.tsx` (line 42)
**Issue:** Six hardcoded dollar amounts: `$139`, `$347`, `$991`, `$47`, and `3 x $47/month`. The Paywall was fixed to use dynamic pricing, but Pricing.tsx and CTA.tsx still have hardcoded values. If prices change in Stripe, the landing page will be wrong.
**Fix:** For Pricing.tsx, use `useCoursePrice` for the core price and fetch the premium price dynamically (or store it in `course_settings`). For installments, either fetch from Stripe or use generic text. For CTA.tsx, use `useCoursePrice` instead of hardcoded "$139 AUD".

### Bug 2: `course_completion_enabled` not in public-safe RLS allowlist
**Severity: Medium**
**File:** `src/pages/ModulePage.tsx` (line 103), RLS policy on `course_settings`
**Issue:** ModulePage fetches `course_completion_enabled` from `course_settings`, but the "Public can read safe settings" RLS policy only allows reading specific keys (`payment_link_core`, `stripe_price_id`, `hero_video_url`, etc.). `course_completion_enabled` is NOT in that list. For non-admin paid users, the "Course users can read all settings" policy covers it, so this works. But if there are any edge cases where the user's access check hasn't resolved yet, the query would fail silently and default to `true`. Low real-world impact but worth noting.

### Bug 3: ResetPassword shows form for ANY logged-in user, not just recovery sessions
**Severity: Medium**
**File:** `src/pages/ResetPassword.tsx` (lines 32-38)
**Issue:** The `getSession()` check on line 33-36 sets `hasSession = true` for ANY valid session, not just recovery sessions. If a logged-in user navigates to `/reset-password` directly, they see the password update form. While not dangerous (they'd be changing their own password), it bypasses the intended "only via reset link" flow and could confuse users who land here accidentally.
**Fix:** Only set `hasSession = true` when the `PASSWORD_RECOVERY` event fires, and add a timeout to show the invalid link message if it doesn't fire within a few seconds.

### Bug 4: Onboarding skips don't mark `onboarding_completed` — user gets re-prompted
**Severity: Low**
**File:** `src/pages/Onboarding.tsx` (lines 112-114)
**Issue:** `handleSkip` navigates to `/dashboard` without saving `onboarding_completed: true`. The next time the user logs in, Login.tsx checks `profile?.onboarding_completed` and redirects them back to `/onboarding`. The user is stuck in a loop until they fill out the form.
**Fix:** Set `onboarding_completed: true` when skipping, so users aren't re-prompted.

### Bug 5: ProgressPage allows navigating to locked modules
**Severity: Low**
**File:** `src/pages/ProgressPage.tsx` (lines 145-163)
**Issue:** Every module in the ProgressPage list is a clickable `<Link>` to `/course/{moduleId}`, regardless of status. On the Dashboard, locked modules have `cursor-not-allowed` and `preventDefault()`. But on ProgressPage, a user can click any module — including ones they haven't unlocked — and navigate to them. The ModulePage itself doesn't enforce sequential access (it only checks `hasAccess`), so users can skip ahead.
**Fix:** Either add the same locking logic as Dashboard, or accept that ProgressPage intentionally allows non-linear access.

### Bug 6: `useCoursePrice` fallback is $99 USD, should be $139 AUD
**Severity: Low**
**File:** `src/hooks/useCoursePrice.ts` (lines 14, 25)
**Issue:** If the `get-price` edge function fails, the fallback is `{ amount: 99, currency: 'usd' }`. This is incorrect — the actual product is $139 AUD. A temporary outage would show the wrong price.
**Fix:** Change fallback to `{ amount: 139, currency: 'aud' }` or show a loading/error state instead of a wrong price.

### Bug 7: Admin "Add New Module" links to `/admin/modules/new` — no route exists
**Severity: Medium**
**File:** `src/pages/admin/AdminDashboard.tsx` (line 156)
**Issue:** The "Add New Module" button links to `/admin/modules/new`. The App.tsx routes have `/admin/modules/:moduleId` which would match this, but the ModuleEditor component likely expects a valid UUID. If it treats "new" as a module ID and queries the database, it will fail.
**Fix:** Verify that ModuleEditor handles the "new" case, or change the link.

---

### Summary

| # | Severity | Bug | Files |
|---|----------|-----|-------|
| 1 | **Medium** | Hardcoded prices ($139, $347, $991, $47) in Pricing + CTA | `Pricing.tsx`, `CTA.tsx` |
| 2 | **Medium** | `course_completion_enabled` not in RLS safe settings list | `ModulePage.tsx`, DB policy |
| 3 | **Medium** | ResetPassword accessible to any logged-in user | `ResetPassword.tsx` |
| 4 | **Low** | Skipping onboarding doesn't save — user gets re-prompted | `Onboarding.tsx` |
| 5 | **Low** | ProgressPage doesn't enforce module locking | `ProgressPage.tsx` |
| 6 | **Low** | `useCoursePrice` fallback is wrong ($99 USD vs $139 AUD) | `useCoursePrice.ts` |
| 7 | **Medium** | Admin "Add New Module" → `/admin/modules/new` may break ModuleEditor | `AdminDashboard.tsx` |

