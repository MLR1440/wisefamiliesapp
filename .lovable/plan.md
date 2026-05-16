## Problem

`downloadDocument` (in `src/lib/documentGenerators.ts`) uses `file-saver`'s `saveAs`, which triggers a hidden `<a download>` click. The Lovable preview iframe is sandboxed without download permission, so the click is silently blocked even though the DOCX blob is built successfully. That's why you see the "Document downloaded!" toast but no file.

This affects both call sites:
- Dashboard "My Documents" list (`src/pages/Dashboard.tsx` → `handleDocumentDownload`)
- Module `DocumentPreview` card (`src/components/module/DocumentPreview.tsx`)

It will already work correctly on the published site (`wisefamilies.app`) and when the preview is opened in its own browser tab. The fix is to also make it work inside the embedded preview.

## Fix

Update `downloadDocument` to be iframe-safe:

1. Generate the DOCX blob (unchanged).
2. Create a blob URL.
3. Detect if we're running inside an iframe (`window.self !== window.top`).
4. If inside an iframe: `window.open(blobUrl, '_blank')` — opens the file in a new tab where the browser can save it normally. If the popup is blocked, fall back to showing a toast with a manual "Open file" action link.
5. If not in an iframe: keep current `saveAs` behavior (clean direct download).
6. Revoke the blob URL after a short delay.

No UI changes, no backend changes, no new dependencies. Pure presentation-layer fix in one file.

## Files touched

- `src/lib/documentGenerators.ts` — replace the body of `downloadDocument` with the iframe-aware logic above.

## Verification

- In the Lovable preview: click Download on a saved document → new tab opens with the .docx (browser will download or preview it).
- In the published app / standalone tab: behavior is unchanged (direct download).
- Toast messaging stays the same.
