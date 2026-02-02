

## Set Up Hourly Cron Job + Admin Settings for Signup Reminders

### Overview
This plan adds:
1. A scheduled cron job to run the `send-signup-reminder` function every hour
2. A new "Signup Reminders" section in Admin Settings with configurable options

---

### Part 1: Set Up pg_cron Job

The cron job will call the `send-signup-reminder` edge function every hour to process unclaimed purchases and send reminder emails.

**SQL to Execute (via SQL insert tool):**
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the signup reminder function to run every hour
SELECT cron.schedule(
  'send-signup-reminders-hourly',
  '0 * * * *',  -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://vfswqkrxwrjzimpzvhen.supabase.co/functions/v1/send-signup-reminder',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmc3dxa3J4d3JqemltcHp2aGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTkxMzcsImV4cCI6MjA4MDM5NTEzN30.vfpfxnmOKBai3OV1nehpBDVTMtWAnlKpxHARcd9l5AM"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

### Part 2: Add Admin Settings UI

Add a new "Signup Reminders" card to the Admin Settings page between "Email Marketing" and "Course Completion" sections.

**New State Variables:**
```typescript
// Signup Reminder settings
const [signupReminderEnabled, setSignupReminderEnabled] = useState(true);
const [signupReminderHours, setSignupReminderHours] = useState('24');
const [signupReminderFromEmail, setSignupReminderFromEmail] = useState('');
const [isSavingSignupReminder, setIsSavingSignupReminder] = useState(false);
```

**Settings to Load:**
- `signup_reminder_enabled` - Toggle (default: true)
- `signup_reminder_hours` - Delay in hours before sending (default: 24)
- `signup_reminder_from_email` - Sender email (must be verified in Resend)

**UI Design:**

| Field | Type | Description |
|-------|------|-------------|
| Enable signup reminders | Switch toggle | Turn on/off the reminder system |
| Delay (hours) | Select dropdown | 12, 24, 48, or 72 hours |
| From email address | Input | Email address for sending (must be verified domain) |

---

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/admin/AdminSettings.tsx` | Update | Add new "Signup Reminders" settings card with toggle, delay selector, and from email input |
| Database (via insert tool) | Execute | Create cron job to run hourly |

---

### Technical Details

**AdminSettings.tsx Changes:**

1. Add new state variables for the 3 settings
2. Load settings in the existing `useEffect` block:
   ```typescript
   setSignupReminderEnabled(getSetting('signup_reminder_enabled') !== 'false');
   setSignupReminderHours(getSetting('signup_reminder_hours') || '24');
   setSignupReminderFromEmail(getSetting('signup_reminder_from_email') || '');
   ```

3. Add save handler:
   ```typescript
   const handleSaveSignupReminder = async () => {
     setIsSavingSignupReminder(true);
     try {
       await Promise.all([
         updateSetting('signup_reminder_enabled', signupReminderEnabled ? 'true' : 'false'),
         updateSetting('signup_reminder_hours', signupReminderHours),
         updateSetting('signup_reminder_from_email', signupReminderFromEmail),
       ]);
       toast.success('Signup reminder settings saved!');
     } catch (error) {
       toast.error('Failed to save signup reminder settings');
     } finally {
       setIsSavingSignupReminder(false);
     }
   };
   ```

4. Add new UI section with:
   - Mail/Bell icon header
   - Enable/disable toggle (like course completion toggle)
   - Delay hours dropdown (12, 24, 48, 72)
   - From email input with helper text about Resend domain verification
   - Info box explaining how the system works

---

### Edge Function Already Configured

The `send-signup-reminder` function already reads these settings:
- `signup_reminder_enabled` - Skips if 'false'
- `signup_reminder_hours` - Uses as delay threshold
- `signup_reminder_from_email` - Uses as sender email
- `course_name` - Uses in email subject/body

No changes needed to the edge function.

