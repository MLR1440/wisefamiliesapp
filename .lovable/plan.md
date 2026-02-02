
# Fix: Hero Video Not Showing for Anonymous Visitors

## Problem Identified
The hero video settings exist in the database but are not visible to visitors on the landing page because of a database security policy (RLS) that blocks unauthenticated users from reading the settings.

## Current Behavior
- **Admin users**: Can read and write settings ✓
- **Logged-in users**: Can read settings ✓  
- **Anonymous visitors (not logged in)**: **Cannot read settings** ✗

## Solution
Add a security policy that allows anyone (including visitors not logged in) to read course settings. This is safe because:
- Course settings contain public information (branding, video URLs, pricing display)
- Write/update access remains restricted to admins only
- No sensitive data is stored in this table

## Implementation

### Database Migration
Add an RLS policy for anonymous access:

```sql
CREATE POLICY "Anyone can read settings" 
ON public.course_settings 
FOR SELECT 
TO anon
USING (true);
```

This creates a policy that:
- Applies to `SELECT` operations (read-only)
- Targets the `anon` role (unauthenticated visitors)
- Allows reading all course settings

## Expected Result
After this change:
- Landing page visitors will see the hero video immediately
- Settings will load without requiring login
- Video will no longer flicker/disappear
- Admin-only write access remains protected

## Files Modified
| Change | Description |
|--------|-------------|
| Database migration | Add RLS policy for anonymous read access on `course_settings` |

## Testing After Implementation
1. Hard refresh the landing page (Ctrl+Shift+R)
2. Verify hero video appears within 1-2 seconds
3. Test in Chrome, Safari, and Brave browsers
4. Confirm video doesn't disappear after loading
