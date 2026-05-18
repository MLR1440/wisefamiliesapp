## Dashboard Color & Visual Polish Plan

### Problem
The dashboard is functional but visually flat — heavy on cream, white cards, and muted greens. The brand's richer palette (gold, blue accent, coral, orange-warm) is underused, making the page feel monochrome and less engaging.

### Proposed Changes

1. **Progress Hero Card — Gradient Ring & Gold Highlight**
   - Replace the solid green progress ring with a `bg-gradient-cta` (gold gradient) stroke for the completed portion.
   - Add a subtle warm glow behind the ring using the existing `--shadow-glow` token.
   - Make the "Continue" button use the `variant="cta"` (gold fill) instead of default primary to make the main action pop.

2. **Quick-Access Cards — Distinct Color Coding**
   - **Child Profile card**: use a soft blue-tinted background (`bg-accent/5`) with a blue icon container (`bg-accent/10`).
   - **My Documents card**: use a soft gold-tinted background (`bg-gold-50`) with a gold icon container (`bg-gold-100`).
   - **Community card**: use a soft green-tinted background (`bg-green-50`) with a green icon container (`bg-green-100`).
   - This creates instant visual scannability — each card has its own personality while staying on-brand.

3. **Chapter Headers — Completion State Color**
   - When a chapter is fully complete, tint the entire header with a very subtle success green (`bg-success/5`) and keep the progress bar solid success green.
   - For incomplete chapters, keep the current neutral style — the contrast makes completed chapters feel rewarding.

4. **Current Module Item — More Prominence**
   - The "Current" pill and module row already have `bg-primary/5`; bump this to `bg-primary/10` and add a subtle left border (`border-l-2 border-primary`) so the active module is instantly findable when a chapter is expanded.

5. **Stats Row Icons — Colorful Micro-accents**
   - The "done / in progress / remaining" row uses muted icons. Color them distinctly:
     - `CheckCircle2` → `text-success`
     - `Clock` → `text-gold-400`
     - `Lock` → keep muted (it's a passive stat)

### Technical Details
- All colors come from existing CSS variables and Tailwind config (`--accent`, `--success`, `gold-*`, `green-*`).
- No new dependencies.
- Single file change: `src/pages/Dashboard.tsx`.
- Estimated effort: small — mostly className updates.
