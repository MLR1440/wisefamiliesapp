

# Plan: Fix Kit.com Tag Application for Quiz Subscribers

## Problem
The current `submit-quiz` Edge Function passes tag names as strings in the subscriber creation request body, but Kit.com's V4 API ignores these. Tags must be applied using a separate API endpoint (`POST /v4/tags/{tag_id}/subscribers`) with numeric tag IDs.

## Solution
Update the Edge Function to:
1. Auto-create tags via Kit's API if they don't already exist (`POST /v4/tags`)
2. Apply each tag to the subscriber using the correct endpoint (`POST /v4/tags/{tag_id}/subscribers`)

This means **no manual tag creation needed** -- the code handles everything automatically.

## How It Will Work

```text
Quiz Submitted
      |
      v
Create/Update Subscriber (POST /v4/subscribers)
      |
      v
For each tag name (e.g. "age:8-11", "quiz:growing"):
   1. Create tag via POST /v4/tags (returns existing ID if already exists)
   2. Apply tag via POST /v4/tags/{tag_id}/subscribers with email
      |
      v
Add subscriber to Quiz Form (POST /v4/forms/{id}/subscribers)
```

## File to Update

### supabase/functions/submit-quiz/index.ts

Changes:
- Remove `tags` array from the subscriber creation body (Kit V4 ignores it)
- Add a helper function to create-or-get a tag by name via `POST /v4/tags`
- After subscriber creation, loop through each tag and apply it via `POST /v4/tags/{tag_id}/subscribers` with the subscriber's email
- Keep existing form subscription and database logic unchanged

## Tags That Will Be Auto-Created

Based on quiz answers:
- `age:under-8`, `age:8-11`, `age:12-14`, `age:15-plus`
- `concern:homework`, `concern:misinformation`, `concern:screen-time`, `concern:social`
- `approach:guided`, `approach:monitoring`, `approach:no-rules`, `approach:banned`
- `quiz:ai-ready` (score 7+), `quiz:growing` (score 4-6), `quiz:early` (score 0-3)

## Technical Details

The Kit V4 tag creation endpoint (`POST /v4/tags`) is idempotent-like -- if a tag with the same name exists, it returns the existing tag's ID (status 200) rather than creating a duplicate (status 201). This makes it safe to call every time without checking first.

Tag application endpoint: `POST /v4/tags/{tag_id}/subscribers` with body `{"email_address": "user@example.com"}`

All requests use the `X-Kit-Api-Key` header.

## Verification
After deployment:
1. Complete the quiz with a test email
2. Check Kit.com dashboard -- subscriber should appear with all relevant tags applied
3. Confirm `kit_subscriber_id` is populated in the database

