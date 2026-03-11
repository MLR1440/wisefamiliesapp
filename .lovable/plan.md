

## Clean Up Test Data and Fix Reminder Logic

### Problem
1. Old test records in `pending_purchases` have `claimed_at` timestamps but `claimed_by` is NULL, causing repeated reminder emails to your own addresses
2. Today's customer may not have a `pending_purchases` record at all (need to verify the purchase flow)

### Changes

**1. Delete old test/claimed records (data cleanup)**
Use the insert tool to delete the 6 problematic records that have `claimed_at` set but are still triggering reminders:
```sql
DELETE FROM pending_purchases 
WHERE claimed_at IS NOT NULL 
  AND id IN ('5c73eea1-...', 'f9fdfc2c-...', '1988df80-...', '061a0569-...', 'd4b51216-...');
```
Also delete the unclaimed `admin@wisefamilies.co` test record.

**2. Fix the reminder function to also check `claimed_at`**
Update `supabase/functions/send-signup-reminder/index.ts` to filter out records where `claimed_at` is not null, preventing this class of bug in future:
```
.is('claimed_by', null)
.is('claimed_at', null)    // ADD THIS LINE
```

**3. Investigate missing customer record**
Check the `verify-stripe-session` function to understand why today's purchase didn't create a `pending_purchases` row — this is likely why the customer won't receive the reminder even after 24 hours.

### Files Changed
- `supabase/functions/send-signup-reminder/index.ts` — add `claimed_at IS NULL` filter
- Database: delete 6 old test records

