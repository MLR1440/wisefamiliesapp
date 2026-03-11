

# Full App Audit: Course Settings RLS Change

## What We're Changing
Restricting the `course_settings` table from fully public (`SELECT` with `USING (true)`) to a whitelist-based approach where only specific keys are publicly readable.

## Audit Results

### 1. Public Landing Page (Unauthenticated Users)

| Component | Keys Read | Method | Impact |
|-----------|-----------|--------|--------|
| Hero.tsx | `hero_video_url`, `hero_video_type` | Direct DB query via `useCourseSettings` (reads ALL keys) | SAFE -- both keys are in the proposed whitelist |
| Pricing.tsx | Payment links | Via `get-payment-links` edge function (service role) | SAFE -- bypasses RLS entirely |
| Price display | `stripe_price_id` | Via `get-price` edge function (service role) | SAFE -- bypasses RLS entirely |

**Risk**: The `useCourseSettings` hook does `select('*')`, which means for anonymous users it will now return only whitelisted keys instead of all keys. This is fine because Hero only uses `hero_video_url` and `hero_video_type`, both whitelisted. No other public page component uses this hook.

### 2. Authenticated Student Pages

| Component | Keys Read | Impact |
|-----------|-----------|--------|
| ModulePage.tsx | `course_completion_enabled` | SAFE -- new "Course users can read all settings" policy covers this |
| CourseComplete.tsx | `congratulations_video_url`, `congratulations_video_type`, `congratulations_title`, `congratulations_message` | SAFE -- same policy covers this |

### 3. Admin Pages

| Component | Keys Read | Impact |
|-----------|-----------|--------|
| AdminSettings.tsx | ALL keys | SAFE -- existing "Admins can manage all settings" ALL policy already grants full access |
| useCourseExport.ts | ALL keys | SAFE -- admin-only feature, same policy |

### 4. Edge Functions (All use service role key -- RLS bypassed)

| Function | Keys Read | Impact |
|----------|-----------|--------|
| chat | `guardrail_appendix` | SAFE |
| get-payment-links | `payment_link_*` | SAFE |
| get-price | `stripe_price_id` | SAFE |
| create-payment | `stripe_price_id` | SAFE |
| check-payment | email marketing settings | SAFE |
| verify-stripe-session | `stripe_price_id_*` | SAFE |
| claim-purchase | email marketing settings | SAFE |
| send-signup-reminder | `signup_reminder_*`, `course_name` | SAFE |

### 5. Onboarding Flow

The onboarding flow (`/onboarding` page) does NOT read from `course_settings` at all. It only writes to `user_profiles`. **No impact.**

### 6. Authentication Flow

Login, signup, and session validation do not interact with `course_settings`. **No impact.**

---

## Conclusion

The proposed RLS change is safe to proceed with. All access patterns are covered:

- **Anonymous users** only need `hero_video_url` and `hero_video_type` (both whitelisted)
- **Authenticated course users** get full read access via the new `user_has_course_access` policy
- **Admins** retain full access via existing ALL policy
- **Edge functions** bypass RLS entirely using service role

## Implementation (Single Database Migration)

```sql
-- Drop overly permissive public read policies
DROP POLICY IF EXISTS "Anyone can read settings" ON public.course_settings;
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.course_settings;

-- Allow public access ONLY to non-sensitive setting keys
CREATE POLICY "Public can read safe settings"
ON public.course_settings
FOR SELECT
TO anon, authenticated
USING (
  key IN (
    'payment_link_core',
    'payment_link_core_installments',
    'payment_link_premium',
    'stripe_price_id',
    'hero_video_url',
    'hero_video_type',
    'course_name',
    'course_subtitle',
    'branding_logo_url'
  )
);

-- Authenticated users with course access can read all settings
CREATE POLICY "Course users can read all settings"
ON public.course_settings
FOR SELECT
TO authenticated
USING (user_has_course_access(auth.uid()));
```

No frontend or edge function code changes are needed.
