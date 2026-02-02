

## Update Signup Reminder Email Branding

### Overview
Update the signup reminder email template to use your brand colors and ensure the correct product name is displayed.

---

### Changes Required

#### 1. Update Email Colors in Edge Function

**File:** `supabase/functions/send-signup-reminder/index.ts`

| Element | Current (Blue) | New (Brand) |
|---------|----------------|-------------|
| Heading "Almost There!" | `#2563eb` | `#003400` (Deep Green) |
| CTA Button Background | `#2563eb` | `#f2ba3f` (Golden Yellow) |
| CTA Button Text | `white` | `#003400` (Deep Green for contrast) |

#### 2. Set Course Name in Database

Add the `course_name` setting to `course_settings` table so the email displays "A.I - Ready Family Framework" instead of "Wise Families".

---

### Updated Email Template Colors

```html
<!-- Heading -->
<h1 style="color: #003400; margin: 0;">Almost There!</h1>

<!-- Button -->
<a href="${signupUrl}" style="display: inline-block; background-color: #f2ba3f; color: #003400; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Create My Account</a>
```

---

### Database Change

```sql
INSERT INTO course_settings (key, value, description)
VALUES ('course_name', 'A.I - Ready Family Framework', 'The official course/product name used in emails and UI')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

---

### Result Preview

After these changes, your email will show:
- **Heading**: "Almost There!" in Deep Green
- **Button**: Golden Yellow with Deep Green text
- **Product name**: "A.I - Ready Family Framework" throughout the email

