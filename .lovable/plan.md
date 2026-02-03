

# Lead Capture Quiz for WiseFamilies Landing Page

## Overview

Add an interactive quiz that helps parents assess their child's AI-readiness while capturing their email. The quiz will:
- Increase lead quality by engaging only genuinely interested parents
- Provide immediate value (personalized assessment)
- Create a natural email capture point
- Integrate seamlessly with your existing Kit.com email marketing

## Recommended Placement

Based on your current page flow, the ideal placement is **after the Hero section and before ProblemValidation**. This:
- Captures visitors while engagement is highest
- Provides a low-commitment first interaction
- Acts as a "hook" before the sales content

Alternative: As a floating CTA button that triggers a modal quiz (available throughout the page).

## Quiz Structure

### Quiz Content (5-6 questions)
Questions designed to qualify leads while providing genuine value:

1. **Child's Age Range** - Determines course fit
2. **Current AI Usage** - "Has your child used ChatGPT or similar AI tools?"
3. **Biggest Concern** - Homework shortcuts / misinformation / screen time / social impact
4. **Current Approach** - Banning / monitoring / no rules / unsure
5. **Confidence Level** - "How confident do you feel guiding your child on AI?" (1-5 scale)
6. **Email Capture** - "Where should we send your personalized AI-Readiness Score?"

### Results Page
After email submission, show:
- A personalized "AI-Readiness Score" (e.g., "Your family's AI-Readiness: 6/10")
- 2-3 specific recommendations based on their answers
- Clear CTA to explore the course

## Technical Implementation

### Database

New table: `quiz_leads`

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| email | TEXT | Lead email (required) |
| answers | JSONB | All quiz responses |
| score | INTEGER | Calculated readiness score |
| source | TEXT | Where quiz was triggered (hero/modal) |
| created_at | TIMESTAMP | For analytics |
| kit_subscriber_id | TEXT | Kit.com subscriber ID after sync |

RLS policies:
- Anonymous users can INSERT (submit quiz)
- Only admins can SELECT (view leads)

### Components

| File | Purpose |
|------|---------|
| `src/components/landing/Quiz.tsx` | Main quiz container with step navigation |
| `src/components/landing/QuizQuestion.tsx` | Reusable question component |
| `src/components/landing/QuizResults.tsx` | Results page with score and recommendations |
| `src/hooks/useQuiz.ts` | Quiz state management and submission logic |

### Kit.com Integration

Create a dedicated quiz form in Kit.com, then:
- Add `KIT_QUIZ_FORM_ID` to course_settings
- Sync leads to Kit.com immediately on submission
- Tag subscribers based on quiz answers (e.g., "concern:homework", "age:12-14")

### Edge Function (Optional Enhancement)

`supabase/functions/submit-quiz/index.ts`:
- Validates quiz data
- Calculates readiness score
- Syncs to Kit.com with custom tags
- Sends welcome email with detailed results

## User Flow

```text
[Hero Video]
    |
    v
[Quiz Section]
    |
    +--> "Discover Your Family's AI-Readiness"
    |
    v
[Question 1] --> [Question 2] --> ... --> [Email Capture]
    |
    v
[Results Page]
    |-- AI-Readiness Score: 6/10
    |-- "Based on your answers, here's what we recommend..."
    |-- [CTA: Start the Course →]
    |
    v
[Rest of landing page continues]
```

## Scoring Logic

Simple weighted scoring:

| Answer Type | Points |
|-------------|--------|
| Child already using AI | +2 |
| Parent has some approach | +1 |
| High concern level | +1 |
| Confident about guidance | +2 |
| ...etc |

Score ranges:
- 8-10: "AI-Ready Foundation" (still recommend course to strengthen)
- 5-7: "Growing Awareness" (great fit for the course)
- 1-4: "Early Days" (course will be transformative)

## Design Approach

- Match existing landing page aesthetics (gradients, card styles, Tailwind classes)
- Progress indicator showing step X of 6
- Mobile-optimized layout
- Smooth transitions between questions
- Green success styling for completion

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/landing/Quiz.tsx` | Create - Main quiz component |
| `src/components/landing/QuizQuestion.tsx` | Create - Reusable question |
| `src/components/landing/QuizResults.tsx` | Create - Results display |
| `src/hooks/useQuiz.ts` | Create - Quiz state and submission |
| `src/pages/Index.tsx` | Modify - Add Quiz after Hero |
| `supabase/functions/submit-quiz/index.ts` | Create - Backend submission |
| Database migration | Create - quiz_leads table |

## Benefits

1. **Higher Quality Leads** - Only engaged parents complete quizzes
2. **Segmentation** - Tag leads by concern, child age, confidence level
3. **Immediate Value** - Parents get personalized insights instantly
4. **Warm Leads** - By the time they see pricing, they're pre-qualified
5. **Analytics** - Understand your audience better from quiz data

