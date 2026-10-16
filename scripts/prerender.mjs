import { build } from 'vite';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Keep the server bundle out of dist, which is the only directory published.
const temporary = await mkdtemp(resolve('.public-render-'));
try {
  await build({
    mode: process.argv[2] || 'production',
    build: {
      ssr: 'src/entry-public.tsx',
      outDir: temporary,
      copyPublicDir: false,
      rollupOptions: { output: { entryFileNames: 'entry-public.mjs' } },
    },
  });
  const { renderPublicPage } = await import(pathToFileURL(join(temporary, 'entry-public.mjs')).href);
  const { html, head } = renderPublicPage();
  if (!html.includes('<main') || !head.includes('rel="canonical"')) {
    throw new Error('Public render is missing essential content or canonical metadata');
  }
  let template = await readFile('dist/index.html', 'utf8');
  // The React SEO component owns these tags in the built HTML and browser alike.
  template = template.replace(/<title>[^<]*<\/title>/g, '')
    .replace(/<meta\b[^>]*(?:name="(?:description|twitter:title|twitter:description)"|property="(?:og:title|og:description|og:url)")[^>]*>/g, '');
  template = template.replace('</head>', `${head}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  await writeFile('dist/index.html', template);
  console.log('Public offer and metadata included in dist/index.html');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
