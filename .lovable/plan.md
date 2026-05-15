# Course UI Polish Plan

Based on a review of the **Dashboard** (course home) and **Module page** (the `/course/:id` view you're on), the structure is solid — but a few changes would make it feel more polished and easier to navigate. Nothing here changes functionality, only presentation.

## Dashboard improvements

1. **Tighten the top stack.** Right now there are 5 stacked card sections (progress, child profile, documents, community, course content) all the same width and styling — it reads as a long scroll with no hierarchy.
   - Move **Child Profile**, **Documents**, and **Community** into a compact 3-column "quick access" row (collapses to stacked on mobile), each as a smaller summary card with one CTA.
   - Promote **Course Content** to be the primary focus directly under the progress bar.

2. **Better progress card.**
   - Replace the linear bar with a **circular progress ring** showing % complete next to the "Continue" button — more visual, more rewarding.
   - Show the **next module title** under the Continue button ("Continue: Module 4 — …") so users know what they're clicking into.

3. **Course content list polish.**
   - Add a **chapter-level progress bar** (thin, under chapter title) instead of just "3/5".
   - Show each module's **estimated time** (e.g., "10 min") on the right side.
   - Add a subtle **"Current" pill** on the active module so it's immediately spottable when chapters are expanded.

4. **Welcome line.** Add the date or a one-line streak/encouragement under "Welcome back" to make the page feel alive.

## Module page improvements

5. **Sticky compact header on scroll.** Once the user scrolls past the title, collapse it into a slim sticky bar showing: chapter › module title · "Module X of Y" · mini progress dots. Makes long video/chat sessions easier to navigate without scrolling back up.

6. **Module position indicator.** Add "**Module 7 of 24**" near the chapter pill so users always know where they are.

7. **Read Along styling.** Currently it's the same card style as everything else. Give it a slightly different accent (left border in primary color, or a soft tinted background) so it visually reads as a secondary/optional resource.

8. **"Mark Complete" footer.**
   - The pill is good but the entire footer card competes with it. Reduce the footer's background/border and let the completion pill be the visual hero.
   - When `!hasInteracted`, show the helper text on mobile too (currently hidden) — small italic line under the pill.

9. **Next/Previous buttons.** The next button shows only the title — add the **module number** ("07 — Title") for spatial awareness, and use an arrow card (with title + chapter label stacked) instead of a single-line button. Standard course-platform pattern (Teachable, Maven).

10. **Chapter transition celebration.** When completing the last module of a chapter, show an inline mini-celebration banner (not just a toast) with the next chapter's title and a "Start [Next Chapter]" button — toasts disappear too quickly.

## Cross-cutting polish

11. **Consistent card radius & shadow.** Cards currently use `rounded-xl border` with no shadow. Add a very subtle `shadow-sm` and bump to `rounded-2xl` for a softer, more premium feel that matches the brand's warm palette.

12. **Empty state illustrations.** "No documents yet" and "No content available" are plain text. Add a small line-art illustration or icon-in-circle for warmth.

13. **Hover affordances.** Module rows have an arrow that fades in on hover (good). Apply the same pattern to chapter headers and the document list.

## Scope & approach

- Pure presentation: only `src/pages/Dashboard.tsx`, `src/pages/ModulePage.tsx`, and possibly small additions to `src/index.css` for the circular ring component.
- No DB, hook, or business-logic changes.
- All colors via existing semantic tokens (`primary`, `success`, `muted`) — no hardcoded values.

## Suggested order

If you want to do it in passes rather than all at once:
- **Pass 1 (highest impact):** #1 (compact dashboard layout), #2 (circular ring + next-up label), #5 (sticky module header), #6 (Module X of Y).
- **Pass 2 (polish):** #3, #7, #8, #9.
- **Pass 3 (delight):** #10, #11, #12, #13.

Tell me which passes you want and I'll implement them. Or pick individual numbers and I'll do just those.
