

## Plan: Hero CTA + Transformation Section + FAQ Schema + Reorder Sections

### 1. Hero CTA — Add direct purchase button
**`src/components/landing/Hero.tsx`**
- Keep "See What's Inside" as a secondary/ghost button
- Add a primary CTA button above it: "Join as Founding Member — {formattedPrice}" linking to `#pricing`
- Import and use `useCoursePrice` for the dynamic price display

### 2. Before/After Transformation Section
**New file: `src/components/landing/Transformation.tsx`**
- Two-column layout: "Before" (red/warning tones) vs "After" (green/success tones)
- Content derived from the course chapters:
  - Before: "Unsure what AI tools your child is using" → After: "Full visibility into their AI habits"
  - Before: "Constant fights about screen time and technology" → After: "Collaborative family tech agreement everyone follows"
  - Before: "Worried AI is doing their thinking for them" → After: "Kids who use AI as a tool, not a crutch"
  - Before: "Feeling one step behind the technology" → After: "Confident parent who guides, not restricts"
  - Before: "No framework — just reacting to each new AI tool" → After: "A clear 30-day action plan and long-term strategy"

**`src/pages/Index.tsx`** — Insert `<Transformation />` after `<Solution />` (before CourseContent)

### 3. FAQ Schema Markup (JSON-LD)
**`src/components/landing/FAQ.tsx`**
- Add a `<script type="application/ld+json">` tag in a `<Helmet>`-style approach (or `useEffect` with `document.head.appendChild`) containing FAQPage structured data built from the `faqs` array
- Since no `react-helmet` is installed, use a simple `useEffect` to inject/clean up the script tag

### 4. Move "Who This Is For" up
**`src/pages/Index.tsx`** — Move `<WhoThisIsFor />` from after `WhatMakesThisDifferent` to after `Quiz` (before `ProblemValidation`). This places it early in the page so visitors quickly self-identify before diving into the problem/solution content.

New section order:
```text
Hero
Quiz
WhoThisIsFor        ← moved up
ProblemValidation
Solution
Transformation      ← new
CourseContent
WhatMakesThisDifferent
Pricing
Guarantee
FAQ
CTA
ContactPrompt
AffordabilityPrompt
```

### Files Changed
- `src/components/landing/Hero.tsx` — add primary purchase CTA
- `src/components/landing/Transformation.tsx` — new component
- `src/components/landing/FAQ.tsx` — add JSON-LD schema
- `src/pages/Index.tsx` — reorder sections, add Transformation import

