

## Add "Can't Afford It?" Section at Bottom of Landing Page

Add a new section below the ContactPrompt (making it the very last section before the footer) with empathetic copy inviting families who can't afford the course to reach out.

### Changes

**New file: `src/components/landing/AffordabilityPrompt.tsx`**
- Soft, empathetic section with messaging like: "If you truly want this for your family but finances are standing in the way, please reach out. We don't want money to be the reason your family misses out."
- "Reach Out" button linking to `mailto:hello@wisefamilies.co`
- Subtle styling — muted background, smaller text, warm tone. Distinct from the main CTA so it doesn't undercut the pricing.

**`src/pages/Index.tsx`**
- Import and place `<AffordabilityPrompt />` after `<ContactPrompt />` (last section before Footer).

