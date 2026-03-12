

## Fix: Mobile CTA Button Sizing

The "Join as Founding Member" button on mobile uses `size="xl"` with `px-10 py-6 text-lg`, making it stretch too wide and look like a banner rather than a button.

### Change in `src/components/landing/Hero.tsx` (line 136)

Replace the Button props to use responsive sizing:
- Mobile: `size="lg"`, smaller padding (`px-6 py-3`), `text-base`
- Desktop: scale up with `sm:` prefixes (`sm:px-10 sm:py-6 sm:text-lg sm:h-14 sm:rounded-xl`)

This keeps it looking like a proper tappable button on the 390px viewport while preserving the large CTA appearance on desktop.

