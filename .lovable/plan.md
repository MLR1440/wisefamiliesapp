

## Fix Legal Links and Update Signup Right Panel

### Changes

**1. Fix Terms/Privacy links in `src/pages/Signup.tsx` (lines 315-321)**
Change `<Link to="/terms">` and `<Link to="/privacy">` to external `<a>` tags pointing to:
- `https://wisefamilies.co/terms-of-use/`
- `https://wisefamilies.co/privacy-policy/`

**2. Fix Terms/Privacy links in `src/pages/PaymentSuccess.tsx` (lines 404-406)**
Same change — replace internal `<Link>` with external `<a>` tags.

**3. Update Signup right panel (lines 378-392)**
Replace the "200+ parents" blurb and Sarah testimonial with a course preview teaser, e.g.:
- "Here's What You're About to Discover"
- Bullet list of key course highlights (AI-Ready Family Framework, 7 chapters, practical tools, community access)
- Brief exciting summary

Footer links are already correct.

### Files Changed
- `src/pages/Signup.tsx` — fix legal links + replace right panel content
- `src/pages/PaymentSuccess.tsx` — fix legal links

