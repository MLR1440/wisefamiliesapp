

## Admin Manual User Creation Feature

### Overview
Add the ability for admins to manually create user accounts directly from the User Management page. This bypasses the normal payment-first signup flow and allows admins to grant access to users (e.g., for comps, partners, or special cases).

### User Flow
1. Admin clicks "Add User" button in the User Management header
2. A dialog opens with a form to enter user details
3. Admin fills in: email, first name, last name, and optionally assigns admin role
4. On submit, a new edge function creates the user account and grants course access
5. The new user receives a password reset email to set their password
6. User list refreshes to show the new user

### Components to Create/Modify

#### 1. New Edge Function: `create-user`
**Location:** `supabase/functions/create-user/index.ts`

**Responsibilities:**
- Verify the requesting user is an admin (using existing pattern from `list-users`)
- Use Supabase Admin API to create the user account with email/password
- Generate a temporary random password (user will reset via email)
- Create a `user_purchases` record to grant course access (with a special `product_id` like "admin_granted")
- Optionally create a `user_roles` record if admin role is requested
- Trigger a password reset email so the user can set their own password
- Return success/failure status

**Security:**
- Only accessible to admins (JWT validation + role check)
- Uses service role key for admin operations
- Validates email format and required fields

#### 2. New Component: `CreateUserDialog`
**Location:** `src/components/admin/CreateUserDialog.tsx`

**Features:**
- Modal dialog triggered by "Add User" button
- Form fields:
  - Email (required)
  - First Name (required)
  - Last Name (required)
  - Grant Admin Role (checkbox, optional)
- Form validation using zod
- Loading state during submission
- Success/error toast notifications
- Auto-closes and refreshes user list on success

#### 3. Update: `AdminUsers.tsx`
**Location:** `src/pages/admin/AdminUsers.tsx`

**Changes:**
- Add "Add User" button in the header section
- Import and render `CreateUserDialog`
- Pass `fetchUsers` as a callback to refresh after creation

### Technical Details

#### Edge Function Implementation

```text
┌─────────────────────────────────────────────────────────────┐
│                    create-user Flow                         │
├─────────────────────────────────────────────────────────────┤
│  1. Validate admin JWT                                      │
│  2. Parse request body (email, firstName, lastName, isAdmin)│
│  3. Create auth user with temporary password                │
│  4. Set user metadata (first_name, last_name)               │
│  5. Insert user_purchases record (grants course access)     │
│  6. If isAdmin, insert user_roles record                    │
│  7. Send password recovery email                            │
│  8. Return success response                                 │
└─────────────────────────────────────────────────────────────┘
```

#### Database Operations
- **user_purchases**: Insert with `product_id: "admin_granted"` and `stripe_session_id: "manual_{timestamp}"` to distinguish from paid users
- **user_roles**: Optionally insert with `role: "admin"` if checkbox selected
- **user_profiles**: Created automatically by existing trigger or needs manual insert

#### Config Update
Update `supabase/config.toml` to register the new edge function:
```toml
[functions.create-user]
verify_jwt = false
```

### File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/create-user/index.ts` | Create | New edge function for admin user creation |
| `supabase/config.toml` | Update | Add function config entry |
| `src/components/admin/CreateUserDialog.tsx` | Create | Dialog component with user creation form |
| `src/pages/admin/AdminUsers.tsx` | Update | Add "Add User" button and dialog integration |

### Edge Cases Handled
- Email already exists: Return friendly error message
- Invalid email format: Client-side and server-side validation
- Missing required fields: Form validation prevents submission
- Network errors: Toast notification with retry option
- Admin creating another admin: Requires explicit checkbox confirmation

### Security Considerations
- Admin role verified server-side before any user creation
- Temporary password is randomly generated (never exposed)
- User must go through password reset to gain access
- All operations logged for audit trail
- Service role key only used in edge function (not exposed to client)

