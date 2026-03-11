

## Full App Bug Scan Results (Round 2)

After reviewing all pages, hooks, and components, here are the remaining bugs:

### Bug 1: Footer "Get Started" links to `/signup` which bounces users without a payment token
**File:** `src/components/layout/Footer.tsx` line 64
**Issue:** For logged-out users, the footer shows a "Get Started" link pointing to `/signup`. But `/signup` requires a `purchase_claim_token` in localStorage — without one, the user is immediately redirected to `/` with a toast saying "Please complete payment first." This is confusing.
**Fix:** Change the link to point to `/#pricing` instead.

### Bug 2: Paywall and Pricing fallback links go to `/signup` (same bounce issue)
**Files:** `src/components/Paywall.tsx` line 72, `src/components/landing/Pricing.tsx` lines 91 and 161
**Issue:** When no Stripe payment link is loaded yet (e.g. while loading or if the edge function fails), the fallback `<Link to="/signup">` sends users to the signup page — which will bounce them right back. These should link to `/#pricing` or show a disabled state instead.
**Fix:** Change fallback links from `/signup` to `/#pricing`, or disable the button while loading.

### Bug 3: Paywall installment price is hardcoded `$47`
**File:** `src/components/Paywall.tsx` line 84
**Issue:** `"or pay in 3 installments of $47"` is a hardcoded string. If the installment price changes in Stripe, this will be wrong. Same issue as the previously-fixed main price.
**Fix:** Either fetch the installment price dynamically or remove the specific dollar amount and just say "or pay in installments".

### Bug 4: ForgotPassword — no password update handling after redirect
**File:** `src/pages/ForgotPassword.tsx` line 30-31
**Issue:** The `redirectTo` is set to `${origin}/login`. When the user clicks the reset link in their email, they land on `/login` but there's no mechanism to capture the recovery token and prompt them to set a new password. The auth flow needs to detect `type=recovery` in the URL hash and show a "Set new password" form. Currently the user lands on login with no indication they can set a new password.
**Fix:** Add a password update flow — either on `/login` (detect recovery event in `onAuthStateChange`) or create a dedicated `/reset-password` page.

### Bug 5: ProgressPage uses `hasPurchased` instead of `hasAccess` for navbar
**File:** `src/pages/ProgressPage.tsx` line 97
**Issue:** `<Navbar ... hasPurchased={hasPurchased} ...>` uses `hasPurchased` directly instead of `hasAccess`. This means admins who haven't purchased won't see the Dashboard/Progress/Community nav links, even though they have access.
**Fix:** Change to `hasPurchased={hasAccess}` to match all other pages.

### Bug 6: `isLoading` set to `false` only in `getSession` path, not in `onAuthStateChange`
**File:** `src/contexts/AuthContext.tsx`
**Issue:** If `onAuthStateChange` fires with a valid session before `getSession().then()` resolves, the app shows a loading spinner until `getSession` completes. In most cases this is brief, but on slow connections it can cause a noticeable delay. Already noted in previous scan as low severity — still unfixed.
**Fix:** Set `setIsLoading(false)` at the end of the `onAuthStateChange` handler when a session is present.

---

### Summary

| # | Severity | Bug | Files |
|---|----------|-----|-------|
| 1 | **Medium** | Footer "Get Started" → bounces from `/signup` | `Footer.tsx` |
| 2 | **Medium** | Paywall/Pricing fallback links → `/signup` bounce | `Paywall.tsx`, `Pricing.tsx` |
| 3 | **Low** | Hardcoded installment price "$47" | `Paywall.tsx` |
| 4 | **High** | Password reset flow incomplete — no new password form | `ForgotPassword.tsx`, `Login.tsx` or new page |
| 5 | **Low** | ProgressPage navbar uses `hasPurchased` not `hasAccess` | `ProgressPage.tsx` |
| 6 | **Low** | `isLoading` not cleared in `onAuthStateChange` | `AuthContext.tsx` |

