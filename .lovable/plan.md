

## Quiz Updates: Replace Age Question + Show Score Before Email

### 1. Replace the `childAge` question

Remove the "What age range is your child?" question and replace it with a more engagement-relevant question. Suggestion:

**`motivationLevel`** — "What motivated you to look into AI guidance for your family?"
- "A news story or social media post worried me" (1 pt)
- "My child started using AI tools on their own" (2 pts)  
- "I want to be proactive before it becomes a problem" (2 pts)
- "A friend or educator recommended it" (1 pt)

This keeps the quiz at 8 questions and replaces a demographic question with a motivation/intent signal that's more useful for segmentation.

### 2. Show the basic score/category BEFORE asking for email

Currently the flow is: 8 questions → email step → results. Change it to: 8 questions → basic result + email prompt → full detailed results.

After the last question, show:
- The score circle and category label (e.g. "Growing Awareness — 6/10")
- A teaser like "Want personalized recommendations and tips sent to your inbox?"
- The email input + submit button
- After submitting email, reveal the full recommendations list

### Technical changes

**`src/hooks/useQuiz.ts`**:
- Replace the `childAge` question object with `motivationLevel`
- Add a new state `showingPreview` (true after last question, before email submit)
- Calculate and expose the result immediately after last question is answered (no email needed)
- Keep email submission for Kit sync but decouple it from result display
- Update score normalization divisor (max points changes slightly from 17 to 16)

**`src/components/landing/Quiz.tsx`**:
- Add a new "preview results + email capture" step between questions and full results
- Show the score circle, category badge, and subtitle
- Below that, show email input with CTA "Get Your Personalized Report"
- After email submit (or skip), transition to full QuizResults view

**`src/components/landing/QuizResults.tsx`**:
- No structural changes needed — it already renders based on the result prop

**`supabase/functions/submit-quiz/index.ts`**:
- Update the `childAge` tag logic (line 116-118) to use `motivationLevel` tag instead: `motivation:${answers.motivationLevel}`

### Flow summary

```text
Q1-Q8 → Score Preview (6/10 "Growing Awareness") 
         + "Enter email for detailed tips"
         → [Submit email] → Full recommendations + CTA
         → [Skip] → Full recommendations + CTA (no email captured)
```

