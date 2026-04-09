
## Make Quiz Section Directly Linkable

The Quiz component already has `id="quiz"` on its `<section>` element, so linking to `/#quiz` or `https://wisefamiliesapp.lovable.app/#quiz` will scroll directly to it.

However, since the app uses `BrowserRouter`, hash-based scrolling doesn't happen automatically on page load. We need to add a small scroll-on-mount effect.

### Change in `src/pages/Index.tsx`

Add a `useEffect` that checks `window.location.hash` on mount and scrolls to the matching element:

```tsx
useEffect(() => {
  const hash = window.location.hash;
  if (hash) {
    const el = document.querySelector(hash);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }
}, []);
```

This is the only change needed — the quiz section already has `id="quiz"`, so visitors arriving at `/wisefamiliesapp.lovable.app/#quiz` will scroll directly to it.
