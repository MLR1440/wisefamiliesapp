

## Expand Quiz to 8 Questions

Add 3 new questions to the quiz, bringing the total from 5 to 8 (plus the email step = 9 steps total). The user selected "AI knowledge level" as a topic; we'll round out the other two with complementary themes that strengthen the assessment.

### New Questions (added after the existing 5)

1. **`aiKnowledge`** — "How would you describe your own understanding of AI?"
   - "I could explain it to a friend" (3 pts)
   - "I know the basics" (2 pts)
   - "I've heard of it but not much more" (1 pt)
   - "I'm pretty lost" (0 pts)

2. **`familyDiscussion`** — "How often does your family talk about technology or AI?"
   - "Regularly — it comes up often" (3 pts)
   - "Sometimes, when something prompts it" (2 pts)
   - "Rarely" (1 pt)
   - "Never" (0 pts)

3. **`desiredOutcome`** — "What would success look like for you after this course?"
   - "Confident conversations about AI with my child" (1 pt)
   - "Clear rules and boundaries around AI use" (1 pt)
   - "Knowing how to keep my child safe online" (1 pt)
   - "Understanding AI well enough to guide them" (1 pt)

### Technical Changes

**`src/hooks/useQuiz.ts`**:
- Add the 3 new question objects to `QUIZ_QUESTIONS` array
- Update the score normalization divisor from 11 to ~17 (new max possible points) to keep the 0–10 scale accurate

No other files need changes — the Quiz component, QuizQuestion, and QuizResults all dynamically render based on the questions array.

