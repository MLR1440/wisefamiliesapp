

## Style AI Assistant with AI Purple Theme

Apply the `aipurple` color (already in Tailwind config) to the ChatInterface component to make it visually distinct within the course modules.

### Changes in `src/components/module/ChatInterface.tsx`

**1. Outer container border** (line 278)
- Change `border border-border` to `border-2 border-aipurple/30` for a subtle purple border

**2. Header bar** (lines 286-297)
- Change background to `bg-aipurple/10` with a purple-tinted bottom border `border-b border-aipurple/20`
- Change the Sparkles icon from `text-primary` to `text-aipurple`
- Change the "AI Assistant" text to `text-aipurple`

**3. AI message bubbles** (line 88 in MessageBubble)
- Change assistant bubble from `bg-muted text-foreground` to `bg-aipurple/10 text-foreground` so AI responses have a light purple tint

**4. Starter prompt buttons** (line 305)
- Change hover state from `hover:border-primary/50` to `hover:border-aipurple/50`

**5. Remaining prompts section** (around line 318)
- Same hover treatment for the remaining prompt buttons

**6. Send button** — keep as-is (primary green CTA is fine for the action button)

This creates a clear visual identity for the AI features while staying consistent with the "AI purple" branding from the landing page.

