

## Create Test Purchase Record for Reminder Testing

### Overview
Insert a test record into the `pending_purchases` table with a backdated `created_at` timestamp so it triggers the reminder system.

---

### SQL to Execute

```sql
INSERT INTO pending_purchases (
  stripe_session_id,
  stripe_customer_email,
  product_id,
  price_id,
  amount_total,
  currency,
  created_at,
  verified_at,
  claimed_by,
  reminder_sent_at
) VALUES (
  'cs_test_reminder_' || gen_random_uuid(),
  'YOUR_EMAIL@example.com',  -- Replace with your actual email
  'prod_test',
  'price_test',
  6900,
  'usd',
  now() - interval '25 hours',  -- 25 hours ago (exceeds 24hr default)
  now() - interval '25 hours',
  NULL,  -- Unclaimed
  NULL   -- No reminder sent yet
);
```

---

### What This Creates

| Field | Value | Purpose |
|-------|-------|---------|
| `stripe_session_id` | Unique test ID | Required field |
| `stripe_customer_email` | Your email | Where reminder will be sent |
| `created_at` | 25 hours ago | Exceeds 24hr delay threshold |
| `claimed_by` | NULL | Marks as unclaimed |
| `reminder_sent_at` | NULL | Eligible for reminder |

---

### After Creating

1. Manually trigger `send-signup-reminder` to send the email
2. Check your inbox for the reminder
3. Verify `reminder_sent_at` gets updated in the database

