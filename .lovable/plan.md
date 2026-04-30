## Landing page copy refresh (Hormozi-style)

Goal: reposition the same offer from "thoughtful course" to "30-day implementation system" — without changing product structure, course content, pricing, or checkout flow.

### Decisions locked in from your answers
- **Scarcity counter**: hide the exact "X of 100 claimed" numbers everywhere. Replace with cohort-cap language.
- **Naming**: keep `AI-Ready Families Framework` as the official product name. Lead with "The 30-Day AI-Ready Family Reset" as the positioning headline / subheadline only.
- **Bonuses**: add 4 bonuses inside the Core pricing card as included in founding membership.
- **Premium tier**: rename to "Family AI Strategy Intensive" with rewritten outcome-focused copy. Deliverables unchanged.

---

### 1. Hero (`src/components/landing/Hero.tsx`)
- Keep the existing H1 (`Raise Kids Who Are Wiser Than the AI They Use`) — it's your brand line.
- Add a small eyebrow chip above the H1: `THE 30-DAY AI-READY FAMILY RESET`.
- Replace subheadline with an outcome-focused version:
  > "In 30 days, know exactly how your child is using AI, install a family AI agreement everyone follows, end the homework-cheating panic, and teach them to use AI without outsourcing their thinking. 10 minutes a day. No tech skills required."
- Replace the Founding Member Counter Bar copy:
  - Remove `{spots} of {totalSpots} spots remaining` and `{spotsTaken} claimed`.
  - Replace with: **"Founding cohort now open — capped at 100 families while we refine the program personally."** Keep the progress bar component visually but drive it off a soft visual only (no numbers shown). Optionally remove the bar entirely if cleaner.
- Replace the bottom urgency line `🎉 {spots} founding member spots left…` with:
  > "🎉 Founding cohort pricing — lock in 60% off before the cohort fills. (Normal price $347)"
- No code/logic changes to `useFoundingSpots` — just hide the numbers in the JSX.

### 2. New "What you'll do in 30 days" timeline section
Add a new component `src/components/landing/ThirtyDayTimeline.tsx`, inserted in `src/pages/Index.tsx` **between `Solution` and `Transformation`**. Content:

- Header: **"What You'll Actually Do in the Next 30 Days"**
- Sub: "A clear week-by-week path. Quick wins from night one."
- Cards:
  - **Tonight**: Run the 10-Minute AI Check-In script with your child before bed.
  - **Week 1**: Map exactly how (and where) your child is using AI today.
  - **Week 2**: Build & install your Family AI Agreement — together.
  - **Week 3**: Install the Brain-Before-Bot homework protocol.
  - **Week 4**: Lock in your long-term Co-Pilot Plan.
- Footer line: "10 minutes a day. No banning AI. No becoming the family police."

Use existing card / icon styling (lucide icons: `Moon`, `Search`, `Handshake`, `Brain`, `Target`).

### 3. Pricing (`src/components/landing/Pricing.tsx`)
**Header area**
- Hide the numeric counter (`{spots} of {totalSpots}…` and `{spotsTaken} claimed`). Replace with the same line: "Founding cohort capped at 100 families."
- Bottom urgency pill: replace "Only {spots} founding member spots left…" with: "Founding cohort pricing ends when the cohort fills — then it returns to $347."

**Core card**
- Keep product name `AI-Ready Families Framework`.
- Add a small subtitle line under the H3: **"The 30-Day AI-Ready Family Reset"**.
- Reword 2 of the existing `coreFeatures` to be more outcome-led:
  - "Custom Family Tech Agreement builder" → "Family AI Agreement Builder — no blank-page rules"
  - "Conversation script generator" → "Conversation Script Generator — never wonder what to say"
- Add a **"Founding member bonuses"** subsection below the included list, with 4 bonuses (each a checkmark row, styled distinctly via a `bg-secondary/5` panel and a small `Gift` icon header):
  - Bonus 1: "What to Say When Your Child Says 'Everyone Else Uses ChatGPT'" — script pack
  - Bonus 2: School AI Policy Decoder
  - Bonus 3: Partner Alignment Guide (for when one parent is stricter than the other)
  - Bonus 4: AI Homework Cheat Sheet — by age group
- Note: per your answer, these are presented as included in the founding membership. You'll need to actually create them — flagging now so it's not forgotten.

**Premium card — rename + rewrite**
- New H3: **"Family AI Strategy Intensive"**
- New tagline under the price: "Walk away with a personalised AI safety, homework, privacy & boundaries plan for your specific child."
- Rewrite `premiumExtras` list to outcome stack (deliverables unchanged):
  - "Pre-call family AI assessment"
  - "60-minute private consultation with a qualified child psychologist"
  - "Written, custom Family AI Plan tailored to your child"
  - "30-day follow-up check-in"
  - "Priority community support"
  - "36-month course access (3 years)"
- Button label: "Book Your Strategy Intensive".

### 4. ProblemValidation (`src/components/landing/ProblemValidation.tsx`)
- Add a 5th "cost of waiting" card to sharpen urgency:
  > "Every week without a plan is another week of homework-cheating risk, privacy slip-ups, and AI doing the thinking your child's brain should be doing."
- Closing line stays.

### 5. WhatMakesThisDifferent (`src/components/landing/WhatMakesThisDifferent.tsx`)
Reframe the 3 feature descriptions as effort-reducers:
- AI-Powered Coaching Tools → end with: "So you get a personalised next step the moment something goes wrong — instead of Googling at midnight."
- Private Parent Community → end with: "Real parents, real situations. So you're never the only one figuring this out at 10pm."
- Evidence-Based, Not Fear-Based → keep, tighten last sentence.

### 6. CTA (`src/components/landing/CTA.tsx`)
- Replace the spots-remaining tagline (`{spots} founding member spots remaining at {formattedPrice}`) with: "Founding cohort pricing — {formattedPrice}. Capped at 100 families."
- Keep button copy.

### 7. FAQ (`src/components/landing/FAQ.tsx`)
Add 2 new FAQs at the top to handle objections your friend raised:
- **"How much time do I need each day?"** → "About 10 minutes a day. The whole 30-day reset is designed for busy parents — short scripts, prebuilt templates, and quick wins from night one."
- **"What if my child catches on or pushes back?"** → "The course gives you exact word-for-word scripts for the most common pushbacks ('Everyone uses ChatGPT', 'It's just for ideas', 'But the teacher said it's fine'). You'll never have to wing it."

---

### Files changed
- `src/components/landing/Hero.tsx` — eyebrow, new subheadline, hide numeric counter, urgency line.
- `src/components/landing/Pricing.tsx` — hide counter, add 30-day subtitle, reword 2 features, add bonuses panel, rename + rewrite premium card.
- `src/components/landing/CTA.tsx` — remove spots number from tagline.
- `src/components/landing/ProblemValidation.tsx` — add 5th cost-of-waiting card.
- `src/components/landing/WhatMakesThisDifferent.tsx` — tighten 3 feature descriptions.
- `src/components/landing/FAQ.tsx` — add 2 FAQs.
- `src/components/landing/ThirtyDayTimeline.tsx` — **new** week-by-week section.
- `src/pages/Index.tsx` — insert `<ThirtyDayTimeline />` between `<Solution />` and `<Transformation />`.

### Out of scope (intentionally not changing)
- Course content / chapters / module structure.
- Stripe prices, payment links, or checkout flow.
- `useFoundingSpots` hook (still tracks the data internally — just hidden in UI).
- wisefamilies.co (lead-magnet site) — separate project.
- Bonus assets themselves — copy promises them; you'll need to create the deliverables before the cohort opens widely.

### Open question to flag (not blocking)
The 4 bonuses will be advertised as included in founding membership. Make sure they exist (even as PDFs or short docs) before founding members start asking — otherwise this becomes a refund risk.