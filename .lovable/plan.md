

## Add Hero Video Above the Fold

### Overview
Add a direct video file player to the Hero section, positioned below the headline and CTA button but above the trust signals. This creates an engaging "above the fold" experience that immediately shows visitors what the course offers.

### Visual Layout

```text
┌─────────────────────────────────────────────────────────────┐
│                        Navbar                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         "Raise Kids Who Are Wiser Than the AI..."           │
│                      (Headline)                             │
│                                                             │
│              The complete system for parents...             │
│                     (Subheadline)                           │
│                                                             │
│                  [ See What's Inside ]                      │
│                       (CTA Button)                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │                    VIDEO PLAYER                       │  │  ← NEW
│  │                   (16:9 aspect)                       │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│   │ 7-chap  │ │ AI tool │ │Community│ │Guarantee│          │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                   (Trust Signals)                           │
│                                                             │
│         🎉 Join the first 100 founding families...          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Approach

Since you want to use a direct video file, you'll need to provide the video URL. The implementation will:

1. Add a video player component to the Hero section
2. Use a simple HTML5 video element with controls
3. Style it to match the existing design (rounded corners, border, shadow)
4. Keep it responsive for all screen sizes

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/landing/Hero.tsx` | Update | Add video player below CTA, above trust signals |

### Technical Details

#### Hero Component Update

The video will be added as a new section between the CTA button and the trust signals grid:

- **Container**: `max-w-4xl` to match the content width
- **Styling**: Rounded corners, border, and soft shadow (matching existing card styles)
- **Aspect ratio**: 16:9 using `aspect-video` class
- **Controls**: Native browser video controls for play/pause/volume
- **Animation**: Fade-up entrance animation to match other elements

#### Video Configuration

The video URL will be stored as a constant that you can easily update:
- Placeholder URL initially (you'll replace with your actual video URL)
- Supports MP4, WebM, and other standard formats
- Falls back gracefully if video fails to load

### What You'll Need to Provide

After implementation, you'll need to provide the actual video file URL. Options:
1. **External hosting**: A URL from Vimeo, Wistia, or your own CDN
2. **Storage bucket**: Upload to the project's storage and use that URL

### Mobile Optimization

- Video scales to full width on mobile
- Touch-friendly native controls
- Reduced padding on smaller screens
- Maintains aspect ratio across all breakpoints

