

## Add Score-Specific Insights to Full Results Screen

### How it works now
- After answering all questions, users see a **Score Preview** (score circle + category badge + email capture)
- Clicking "Skip" or submitting email sets `isComplete = true`, which shows the **QuizResults** component
- QuizResults already shows: score circle, category badge, subtitle, reassuring message, description, recommendations list, CTA, blog link

### What changes

The QuizResults component (shown after skip or email submit) will be enhanced with score-specific insight and a single "one step today" action. No changes to the preview/email capture screen.

**`src/hooks/useQuiz.ts`** — Add `insight` and `oneStepToday` fields to `QuizResult`:

- **AI-Ready (7–10):**
  - *Insight:* "Your score of X/10 means you're already having the right conversations and building good habits around technology. Most parents haven't even started thinking about this — you're well ahead. The challenge now is keeping pace as AI tools evolve rapidly. What worked last year might not be enough next year."
  - *One step:* "Ask your child to show you one AI tool they've used recently. Explore it together and talk about what it does well — and where it gets things wrong."

- **Growing (4–6):**
  - *Insight:* "Your score of X/10 means you have good instincts — you know AI matters and you've started paying attention. But there are gaps between awareness and action. Without a structured approach, it's easy to stay in 'I'll deal with it later' mode while your child figures it out alone."
  - *One step:* "Tonight, ask your child: 'What have you heard about AI at school?' Then just listen — no lectures, no judgment. You'll learn more in 5 minutes of listening than an hour of Googling."

- **Early (0–3):**
  - *Insight:* "Your score of X/10 means AI is newer territory for your family — and that's completely fine. What matters is that you're here now. AI tools are already showing up in classrooms, homework apps, and social media. You don't need to become an expert — you just need to know enough to guide the conversation."
  - *One step:* "Spend 5 minutes trying ChatGPT yourself today. Ask it something simple — a recipe, a homework question, anything. Experiencing it firsthand is the fastest way to understand what your child might encounter."

**`src/components/landing/QuizResults.tsx`** — Add a new "What your score means" card and a highlighted "One step today" callout between the category description and the recommendations list. The insight text will include the actual score number for personalisation.

### Files changed
- `src/hooks/useQuiz.ts` — add `insight` and `oneStepToday` to `QuizResult` interface and populate per category
- `src/components/landing/QuizResults.tsx` — render insight card and one-step callout

