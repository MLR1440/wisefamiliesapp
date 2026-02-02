
# Fix: Hero Video Disappearing on Page Load

## Problem Summary
The main video briefly appears (as a loading skeleton), then disappears because of a timing issue in how settings are loaded and checked.

## What's Happening
1. Page loads → shows a loading placeholder for the video
2. Settings finish loading from the database
3. **Bug**: For a split second, the video URL appears "empty" even though it exists in the database
4. Video section hides because it thinks there's no video configured
5. This happens too fast to recover, so the video stays hidden

## Solution
Make the video section wait for settings to fully load before deciding whether to show or hide. The fix ensures:
- Show skeleton while loading
- Only hide if settings are loaded AND no video URL exists

## Technical Changes

### File: `src/components/landing/Hero.tsx`

**Change 1**: Update the visibility condition (line 96)

```text
// Before (buggy)
const showVideoSection = loading || heroVideoUrl;

// After (fixed)
const showVideoSection = loading || Boolean(heroVideoUrl);
```

Actually, the real issue is more subtle - we need to ensure we don't hide prematurely. A better fix:

```typescript
// Keep showing video section while loading, 
// and only hide if we've finished loading AND there's no URL
const showVideoSection = loading ? true : Boolean(heroVideoUrl);
```

**Change 2**: Add a safeguard in `renderVideo()` (around line 42-49)

```typescript
const renderVideo = () => {
  // Show skeleton while loading OR if we haven't gotten the URL yet
  if (loading) {
    return <Skeleton className="w-full h-full" />;
  }

  // Only return null if we've confirmed there's no video
  if (!heroVideoUrl) {
    return null;
  }
  
  // ... rest of video rendering logic
};
```

**Change 3**: Ensure stable state by using a derived "ready" state

To prevent the flicker entirely, we should track when settings are truly ready:

```typescript
const { getSetting, loading, settings } = useCourseSettings();

// Only compute these AFTER loading is complete
const heroVideoUrl = !loading ? getSetting('hero_video_url') : '';
const heroVideoType = !loading ? (getSetting('hero_video_type') || 'vimeo') : 'vimeo';

// Show section during loading, or when we have a valid URL
const showVideoSection = loading || heroVideoUrl.length > 0;
```

## Expected Result
- Video section shows skeleton placeholder during load
- Once settings load, video appears immediately without disappearing
- If no video is configured, the section properly hides

## Files Modified
| File | Change |
|------|--------|
| `src/components/landing/Hero.tsx` | Fix race condition in video visibility logic |
