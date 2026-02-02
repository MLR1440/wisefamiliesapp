
Goal
- Fix the landing-page hero video that flashes briefly then disappears on initial load in Brave/Safari/Chrome.

What I found (why the previous fix didn’t stick)
- The hero video URL is definitely present in the backend settings (network request shows `hero_video_url = https://vimeo.com/1160948188` and `hero_video_type = vimeo`).
- The hero video section is disappearing because the Hero component is deciding `showVideoSection` is false at some point.
- The root cause is still a race, but it’s happening in the settings hook:
  - `useCourseSettings` maintains `settings` and `loading` as separate pieces of state.
  - It sets `setSettings(data)` and then `setLoading(false)` in the same async callback.
  - React state updates are batched and not guaranteed to be reflected in the same render the way we intuitively expect; this can produce a render where `loading === false` but `settings` is still the previous value (initial `[]`), meaning `getSetting('hero_video_url')` returns `''`.
  - In that render, Hero computes `heroVideoUrl === ''` and unmounts the entire video section, which matches the “appears for a millisecond then disappears” symptom.

Solution approach (robust and simple)
- Make “loading vs loaded” impossible to desync from the data by deriving loading from the presence of settings data, instead of tracking it separately.
- Concretely:
  - Store `settings` as `CourseSetting[] | null`.
  - `null` means “not loaded yet”.
  - Once fetch finishes (success or error), set `settings` to an array (possibly empty).
  - Derive `loading` as `settings === null`.
- This guarantees there is never a render where “loading is false but settings are still the old value”.

Implementation steps (code changes)
1) Update `src/hooks/useCourseSettings.ts`
   - Replace:
     - `const [settings, setSettings] = useState<CourseSetting[]>([]);`
     - `const [loading, setLoading] = useState(true);`
   - With:
     - `const [settings, setSettings] = useState<CourseSetting[] | null>(null);`
     - `const loading = settings === null;` (derived)
   - Update `fetchSettings`:
     - Remove `setLoading(true/false)`
     - On success: `setSettings(data ?? [])`
     - On error: set error message and set `setSettings([])` (so the UI leaves “loading” state and can react accordingly)
   - Keep the public API stable:
     - Return `settings: settings ?? []` so existing screens (like Admin Settings) don’t break.
     - Keep returning `loading` (now derived) so existing callers still work.

2) Keep `src/components/landing/Hero.tsx` logic as-is (or minimal touch)
   - With the hook fix, Hero’s current pattern:
     - `heroVideoUrl = !loading ? getSetting(...) : ''`
     - `showVideoSection = loading || heroVideoUrl.length > 0`
     becomes stable, because when `loading` flips to false, the settings array is already present.
   - Optional hardening (if we want belt-and-suspenders):
     - In Hero, also request `settings` from the hook and compute `const ready = !loading && settings.length > 0` to avoid any edge-case empty-state flicker. This should not be necessary after step 1, but it’s available if you want extra resilience.

3) Verify across browsers
   - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R) to avoid cached JS.
   - Confirm on:
     - Chrome
     - Safari
     - Brave
   - Expected:
     - On load: skeleton shows.
     - After settings load: video container remains mounted and iframe appears.
     - No brief flash then disappearance.

Edge cases to handle explicitly
- If the backend request fails:
  - The hero video area should not flicker; it should either remain as a skeleton briefly then disappear (because we can’t confirm a URL) or optionally show a small “video unavailable” message. (We can decide this later; the key is fixing the flicker/disappear bug.)

Notes (non-blocking, but important)
- The security scan flagged that some backend tables could expose sensitive data if policies aren’t tightened (pending purchases, user profiles child fields, etc.). This is separate from the hero video issue, but I can address it after the hero video is stable.

Acceptance criteria
- The hero video does not disappear after page load.
- It behaves consistently across Brave/Safari/Chrome.
- If `hero_video_url` is empty in Admin Settings, the hero video section remains hidden as intended (no blank container after loading).

Feature suggestions (next things you may want)
- After implementing, test the landing page end-to-end on desktop + mobile (especially Safari iOS) to confirm the hero video consistently renders.
- Add a small “video failed to load” fallback UI (retry button / open video in new tab) if Vimeo is blocked by tracker protection.
- Cache course settings in a React context so the app only fetches them once (faster landing page, fewer network calls).
- Add an admin “Preview hero video” button that validates the URL and shows what visitors will see.
- Tighten backend access rules for payment/customer tables and limit what community members can see in profiles.
