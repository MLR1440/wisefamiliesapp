# Fix: purchases can be claimed by the wrong account

## The problem (confirmed)
After checkout, the payment page gives out a claim code. The step that turns that code into course access only checks that the code is valid, unclaimed and not expired. It never checks that the person claiming it is the person who paid. So anyone who gets hold of a recent checkout link can attach the purchase to their own account.

## The fix
1. **Match the email when claiming.** Course access is only granted if the signed-in account's email matches the email used at Stripe checkout (ignoring upper/lower case). If it doesn't match, nothing is claimed and the code stays usable by the real buyer.
2. **Clear message for buyers.** If the emails differ, the signup page shows: "This purchase was made with a different email. Please sign up with the email you used at checkout, or contact support." The code is kept so they can try again with the right email.
3. **Pre-fill the checkout email** on the signup page (when available) so buyers naturally use the matching address.
4. **Safety net:** buyers who truly need a different email can still be set up by you from Admin > Users (existing manual user creation).

## Technical details
- `supabase/functions/claim-purchase/index.ts`: after loading `pending_purchases`, compare `user.email` to `pending.stripe_customer_email` (lowercased, trimmed); return 403 `email_mismatch` if different or if either is missing. Validate `token` as a UUID. Switch the claim update to a conditional update (`claimed_by IS NULL`) before inserting into `user_purchases` to prevent double-claim races.
- `src/pages/Signup.tsx`: handle `email_mismatch` with the message above, keep the token in localStorage, and pre-fill email from the verified session data already returned by the payment page.
- Redeploy `claim-purchase`, test a mismatched and a matching claim, then mark the finding fixed.
