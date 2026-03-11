

## Full App Bug Scan Results

### Bug 1: "Forgot Password" link goes to a non-existent route
**File:** `src/pages/Login.tsx` line 163
**Issue:** `<Link to="/forgot-password">` points to a route that does not exist in `App.tsx`. Clicking it shows the 404 page.
**Fix:** Either create a `/forgot-password` page that calls `supabase.auth.resetPasswordForEmail()`, or remove the link until one is built.

### Bug 2: Password validation mismatch across signup forms
**Files:** `src/pages/Signup.tsx` vs `src/pages/PaymentSuccess.tsx` and `src/pages/Login.tsx`
**Issue:** Signup.tsx validates `min(8)` characters, but PaymentSuccess.tsx and Login.tsx validate `min(6)`. A user could create an account via PaymentSuccess with a 6-character password, but the Signup page would reject it (and vice versa). All should consistently use `min(8)` to match the Signup page's UI hint ("Must be at least 8 characters").
**Fix:** Update PaymentSuccess.tsx and Login.tsx schemas to `min(8)`.

### Bug 3: Login page "Create account" link goes to `/signup` which requires a payment token
**File:** `src/pages/Login.tsx` line 237
**Issue:** The login page links to `/signup`, but the signup page redirects users away if they don't have a `purchase_claim_token` in localStorage. Users who click "Create account" from the login page will be bounced back to the landing page with "Please complete payment first." This is confusing.
**Fix:** Either remove the "Create account" link from Login, or change it to link to `/#pricing` with appropriate copy like "Need to purchase? View pricing".

### Bug 4: Operator precedence bug in AuthContext
**File:** `src/contexts/AuthContext.tsx` line 48
**Issue:** `event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session` is evaluated as `SIGNED_OUT || (TOKEN_REFRESHED && !session)` due to JS precedence, which happens to be correct logically. However, it should have explicit parentheses for clarity and safety.
**Fix:** Add parentheses: `event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)`.

### Bug 5: `isLoading` never set to `false` when `onAuthStateChange` fires first
**File:** `src/contexts/AuthContext.tsx`
**Issue:** `isLoading` is only set to `false` inside the `getSession().then()` block. If `onAuthStateChange` fires with a valid session before `getSession` resolves, the user state updates but `isLoading` remains `true` until `getSession` finishes. This is mostly fine but could cause a brief flash of the loading spinner. Not critical but worth noting.

### Bug 6: `get_founding_spots_remaining` polls every 60 seconds even on the landing page
**File:** `src/hooks/useFoundingSpots.ts`
**Issue:** The `refetchInterval: 60_000` causes a network request every minute as long as any component using this hook is mounted (visible in the network logs — 20+ identical requests). This is wasteful for a number that barely changes.
**Fix:** Increase `refetchInterval` to 5 or 10 minutes, or remove it entirely and rely on `staleTime` alone.

### Bug 7: Paywall shows hardcoded "$139 AUD" instead of dynamic pricing
**File:** `src/components/Paywall.tsx` line 50
**Issue:** The price is hardcoded as `$139 AUD` rather than fetched from Stripe/course_settings. This violates the real-data requirement and will be wrong if pricing changes.
**Fix:** Use the `useStripePrices` or `useCoursePrice` hook to fetch the actual price dynamically.

---

### Summary of fixes needed

| # | Severity | Bug | Files |
|---|----------|-----|-------|
| 1 | **High** | Forgot password link → 404 | `Login.tsx` |
| 2 | **Medium** | Password min length mismatch (6 vs 8) | `PaymentSuccess.tsx`, `Login.tsx` |
| 3 | **Medium** | Login "Create account" → bounces from signup | `Login.tsx` |
| 4 | **Low** | Missing parentheses in auth check | `AuthContext.tsx` |
| 5 | **Low** | Excessive polling (every 60s) | `useFoundingSpots.ts` |
| 6 | **Medium** | Hardcoded price in Paywall | `Paywall.tsx` |

