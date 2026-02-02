

## Add Hero Video URL to Admin Settings

### Overview
Add a new "Landing Page" settings section in Admin Settings where you can paste your Vimeo URL. The Hero component on the landing page will automatically fetch this URL and display the video using an embedded Vimeo player.

### Visual Layout - Admin Settings

```text
┌─────────────────────────────────────────────────────────────┐
│                     Admin Settings                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🎬 Landing Page                                        ││
│  │  ─────────────────────────────────────────────────────  ││
│  │                                                         ││
│  │  Hero Video Type                                        ││
│  │  ┌──────────────────────────────────────┐              ││
│  │  │ Vimeo                            ▼  │              ││
│  │  └──────────────────────────────────────┘              ││
│  │                                                         ││
│  │  Hero Video URL                                         ││
│  │  ┌──────────────────────────────────────────────────┐  ││
│  │  │ https://vimeo.com/123456789                      │  ││
│  │  └──────────────────────────────────────────────────┘  ││
│  │  Paste your Vimeo video URL                            ││
│  │                                                         ││
│  │  [ Save Landing Page Settings ]                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─ AI Guardrails ─────────────────────────────────────────┐│
│  │  ...existing content...                                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### How It Will Work

1. **Admin enters Vimeo URL** in the new "Landing Page" settings section
2. **URL is saved** to the `course_settings` table with keys:
   - `hero_video_url` - The Vimeo URL (e.g., `https://vimeo.com/123456789`)
   - `hero_video_type` - Set to "vimeo" (supports YouTube too if needed later)
3. **Hero component fetches** the setting on page load
4. **Vimeo embed** displays automatically using the existing video player pattern

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/admin/AdminSettings.tsx` | Update | Add "Landing Page" section with hero video URL and type fields |
| `src/components/landing/Hero.tsx` | Update | Fetch video URL from settings and render Vimeo embed |

### Technical Details

#### Admin Settings Changes
- Add new state variables: `heroVideoUrl`, `heroVideoType`
- Load settings on mount: `getSetting('hero_video_url')`, `getSetting('hero_video_type')`
- Save function: `updateSetting('hero_video_url', heroVideoUrl)`
- UI: Input field for URL, dropdown for video type (Vimeo/YouTube/Direct)
- Position: New section at the top, before AI Guardrails

#### Hero Component Changes
- Import and use `useCourseSettings` hook
- Fetch `hero_video_url` and `hero_video_type` settings
- Replace hardcoded video with dynamic Vimeo embed
- Show placeholder/skeleton while loading
- Hide video section entirely if no URL is configured

#### Vimeo Embed Format
The component will convert a Vimeo URL like:
- `https://vimeo.com/123456789`

Into an embed iframe:
- `https://player.vimeo.com/video/123456789`

### What You'll Need To Do
1. Approve this plan
2. After implementation, go to Admin → Settings
3. Paste your Vimeo video URL (e.g., `https://vimeo.com/123456789`)
4. Click "Save Landing Page Settings"
5. Your video will immediately appear on the landing page

