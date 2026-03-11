

## Add AI Purple Color to Hero Heading

### What's Changing
Update the Hero headline so the word "AI" appears in the recognizable AI purple color (the industry-standard violet/purple around #8B5CF6).

### Implementation Details
1. **Add AI purple to Tailwind config**: Create an `aipurple` color palette in `tailwind.config.ts` with the standard AI purple color (#8B5CF6 or #A855F7)
2. **Update Hero component**: Wrap just the word "AI" in a span with the new `text-aipurple` class, keeping "Wiser Than the" and "They Use" in the current primary green color

### Files to Change
- `tailwind.config.ts` — add `aipurple` color palette
- `src/components/landing/Hero.tsx` — wrap "AI" in styled span

### Expected Result
Headline reads: "Raise Kids Who Are Wiser Than the **AI** They Use" with "AI" in purple while the rest stays green.

