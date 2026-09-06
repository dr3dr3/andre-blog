// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://andredreyer.com',
    output: 'static',
    integrations: [mdx(), sitemap()],
    markdown: { syntaxHighlight: false },

    /*
     * Inline the stylesheet rather than linking it.
     *
     * The critical path was two hops — the document, then a render-blocking
     * request for an 11KB stylesheet — and nothing painted until the second
     * landed. Lighthouse measured that at 150ms on the request and 193ms of
     * total critical path latency, and put Speed Index at 3.5s, just over the
     * ~3.4s green boundary. Everything else was already green.
     *
     * Astro's default is 'auto', which inlines a stylesheet only under Vite's
     * 4096-byte assetsInlineLimit. This one has never been that small, so the
     * default has always emitted a separate file.
     *
     * The trade is losing the cross-page cache on the CSS: every page now
     * carries its own copy, ~3.8KB gzipped. That is the right way round for
     * this site. Most arrivals are a single post from a link and never fetch a
     * second page, so the cache almost never pays out, while the extra round
     * trip is charged to every one of those visits.
     */
    build: { inlineStylesheets: 'always' },
});
