# Public search HTML

The production build renders the same public landing-page components into `dist/index.html`. Search and AI retrieval clients can read the course outline, refund terms, public links, canonical and FAQ data before JavaScript runs. The browser then mounts the existing application normally, with live pricing, authentication and navigation.

Only the homepage is rendered during the build. Its isolated entry does not import account, admin or course pages. React effects and query functions do not run during this render, so it does not fetch sessions or private records. The server bundle is temporary and is removed before publishing. The public sitemap contains only `https://wisefamilies.app/`.

Prices and availability still load from the existing public queries in the browser. The build does not freeze those values or change checkout. Some existing copy and fallback values are still part of the landing page; this change is not an offer review.

## Verify

```sh
npm ci
npm run build
npm run verify:public
npm run preview
```

Check that the refund FAQ expands and account navigation works. The guarantee and FAQ use one shared refund-policy constant; the FAQ schema uses the same answer. The mobile menu has an accessible name and expansion state.

## Publish and roll back

Merge the repair branch into the branch connected to the existing Lovable project, wait for its preview to build, then publish the updated app. Confirm that the custom domain returns the offer inside `#root`, one homepage canonical, matching FAQ data and `/sitemap.xml` with HTTP 200. A merged GitHub change alone does not confirm that the custom domain was published.

If rollback is needed, revert the repair commit and republish the previous build. No database, authentication, pricing or payment configuration is migrated by this change.
