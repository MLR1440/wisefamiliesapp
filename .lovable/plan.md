

## Add "Resend Welcome Email" Button to Admin Users Page

### What
Add a button per user row in the admin users table that lets you manually resend the welcome/password-setup email to any user.

### How

**New edge function: `supabase/functions/resend-welcome-email/index.ts`**
- Accepts `{ userId }` in the request body
- Verifies the caller is an admin (same pattern as `create-user`)
- Looks up the user via `auth.admin.getUserById(userId)` to get their email and first name
- Generates a new recovery link via `auth.admin.generateLink({ type: "recovery" })`
- Sends the same branded welcome email via Resend (reusing the exact HTML template from `create-user`)
- Returns success/error

**New file: `supabase/functions/resend-welcome-email/deno.json`**
- Same Resend import as `create-user/deno.json`

**UI: `src/pages/admin/AdminUsers.tsx`**
- Add a "Resend Email" button (Mail icon) in the Actions column next to the existing Delete button
- On click, calls `supabase.functions.invoke('resend-welcome-email', { body: { userId } })`
- Shows a toast on success/error
- Brief loading state on the button while sending

### No database changes needed. Uses existing secrets (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

