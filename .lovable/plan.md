

## Admin User Deletion Feature

### Overview
Add the ability for admins to delete any user account directly from the User Management page. This will include a confirmation dialog with appropriate warnings about the irreversible nature of the action.

### User Flow
1. Admin sees a "Delete" button (trash icon) in the Actions column for each user row
2. Clicking the button opens a confirmation dialog
3. Dialog shows the user's name/email and warns that this action is permanent
4. Admin confirms by clicking "Delete User"
5. Edge function deletes all user data and the auth account
6. User list refreshes to reflect the change
7. Success toast confirms deletion

### Components to Create/Modify

#### 1. New Edge Function: `delete-user`
**Location:** `supabase/functions/delete-user/index.ts`

**Responsibilities:**
- Verify the requesting user is an admin (same pattern as `create-user`)
- Accept `userId` in the request body
- Prevent admin from deleting themselves
- Delete all user data in the correct order (respecting foreign keys):
  1. Messages (via conversation IDs)
  2. Conversations
  3. Events
  4. User progress
  5. User purchases
  6. User memories
  7. User documents
  8. User roles
  9. Community replies
  10. Community topics
  11. User profiles
  12. Auth user record
- Return success/failure status

**Security:**
- Only accessible to admins (JWT validation + role check)
- Uses service role key for deletion operations
- Cannot delete your own account through this endpoint (prevents lockout)

#### 2. New Component: `DeleteUserDialog`
**Location:** `src/components/admin/DeleteUserDialog.tsx`

**Features:**
- Uses AlertDialog component for destructive action confirmation
- Shows user name and email being deleted
- Red "Delete User" button to indicate danger
- Loading state during deletion
- Success/error toast notifications
- Triggers user list refresh on success

#### 3. Update: `AdminUsers.tsx`
**Location:** `src/pages/admin/AdminUsers.tsx`

**Changes:**
- Add new "Actions" column to the table
- Import and render `DeleteUserDialog` for each user row
- Pass user data and `fetchUsers` callback to the dialog
- Hide delete button for the currently logged-in admin (can't delete yourself)

### Technical Details

#### Edge Function Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                    delete-user Flow                         │
├─────────────────────────────────────────────────────────────┤
│  1. Validate admin JWT                                      │
│  2. Parse request body (userId)                             │
│  3. Check userId is not the requesting admin's ID           │
│  4. Delete messages via conversation IDs                    │
│  5. Delete conversations                                    │
│  6. Delete events                                           │
│  7. Delete user_progress                                    │
│  8. Delete user_purchases                                   │
│  9. Delete user_memories                                    │
│  10. Delete user_documents                                  │
│  11. Delete user_roles                                      │
│  12. Delete community_replies                               │
│  13. Delete community_topics                                │
│  14. Delete user_profiles                                   │
│  15. Delete auth user via admin API                         │
│  16. Return success response                                │
└─────────────────────────────────────────────────────────────┘
```

#### Config Update
Update `supabase/config.toml` to register the new edge function:
```toml
[functions.delete-user]
verify_jwt = false
```

### File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/delete-user/index.ts` | Create | New edge function for admin user deletion |
| `supabase/config.toml` | Update | Add function config entry |
| `src/components/admin/DeleteUserDialog.tsx` | Create | Alert dialog component with delete confirmation |
| `src/pages/admin/AdminUsers.tsx` | Update | Add Actions column with delete button |

### Edge Cases Handled
- Admin trying to delete themselves: Prevented with clear error message
- User has no data in some tables: Deletions continue without error
- Network errors: Toast notification with error details
- User already deleted: Graceful handling

### Security Considerations
- Admin role verified server-side before any deletion
- Self-deletion prevented to avoid admin lockout
- All operations use service role key (not exposed to client)
- Cascade deletion ensures no orphaned records

