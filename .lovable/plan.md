

## Reword Quiz Final Screens + Add Blog Link

### What changes

**1. `src/hooks/useQuiz.ts`** — Add category descriptions that give immediate meaning to the score

Each category gets a `description` field mirroring the email's tone:
- **AI-Ready (7-10):** "You've built a strong foundation — you're already paying attention and having conversations most parents haven't started yet. The course will sharpen your approach as AI continues to evolve."
- **Growing (4-6):** "You're aware AI matters and you've taken some steps. A structured approach will help you turn that awareness into confident, everyday guidance for your family."
- **Early (0-3):** "AI is already part of your child's world, even if it doesn't feel like it yet. The good news? Starting now puts you ahead of most families. You don't need to be technical — you just need a plan."

Update `QuizResult` type to include `description: string`.

**2. `src/components/landing/Quiz.tsx`** — Reword the email capture preview screen

- Change the prompt text from "Want personalized recommendations and tips sent to your inbox?" to: **"We'll send you 3 practical actions you can take this week — plus a personalised AI-readiness breakdown — straight to your inbox."**
- Show the category description below the score so parents immediately understand what their result means
- Change CTA button from "Get My Personalized Report" to **"Send Me My Action Plan"**
- Add a blog link below the skip button: **"Just want to explore? Visit our blog for free tips and guides."** linking to `https://wisefamilies.co/blog/`

**3. `src/components/landing/QuizResults.tsx`** — Reword the full results screen

- Add the category `description` paragraph between the subtitle and recommendations
- Change the heading "Based on your answers:" to **"Here's what you can do right now:"**
- Update email confirmation text to: **"Check your inbox — we've sent you 3 practical actions you can take this week plus your full AI-readiness breakdown."**
- Add a secondary blog link below the main CTA: **"Want to learn more? Explore our blog →"** linking to `https://wisefamilies.co/blog/`
- Add reassuring text echoing the email tone: **"The fact that you took this quiz already puts you ahead of most parents."**

### Files changed
- `src/hooks/useQuiz.ts` — add `description` to QuizResult type and category results
- `src/components/landing/Quiz.tsx` — reword email capture screen, add blog link
- `src/components/landing/QuizResults.tsx` — reword results, add description, add blog link

