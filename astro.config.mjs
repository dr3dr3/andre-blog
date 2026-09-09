// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/*
 * The `latin` unicode-range, as shipped by Google Fonts. Kept as a constant
 * because both families repeat it and a mismatch between the two would be
 * invisible until a glyph vanished.
 */
/** @type {[string, ...Array<string>]} */
const LATIN = [
    'U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC', 'U+0304',
    'U+0308', 'U+0329', 'U+2000-206F', 'U+20AC', 'U+2122', 'U+2191', 'U+2193', 'U+2212', 'U+2215',
    'U+FEFF', 'U+FFFD',
];

// https://astro.build/config
export default defineConfig({
    site: 'https://andredreyer.com',
    output: 'static',
    integrations: [mdx(), sitemap()],
    markdown: { syntaxHighlight: false },

    /*
     * Fonts are declared here rather than as hand-written @font-face rules, for
     * a metric-matched fallback per face and for `display: optional`. Both are
     * answers to the same defect, and the second is the one that works
     * everywhere.
     *
     * The hand-written rules used font-display: swap against an unadjusted
     * Georgia and ui-monospace. When the real faces landed, a post summary on
     * the home page gained a line and everything below it moved: Lighthouse
     * measured one layout shift of 0.0677 on `ul.post-index > li`, cause "Web
     * font loaded", which put Cumulative Layout Shift at 0.068 and Performance
     * at 99. `optimizedFallbacks` derives size-adjust and the ascent, descent
     * and line-gap overrides from the actual font files, so the fallback
     * occupies the same space as the real face and the swap moves nothing.
     *
     * That alone did not fix the score, and the reason is worth keeping. Astro
     * builds the adjusted face against `local("Times New Roman")` and
     * `local("Courier New")` — it ships metrics for seven families and none of
     * them is a Linux or Android font. The machine Lighthouse runs on has
     * neither, nor Georgia; it has Liberation and Free. So the adjusted face
     * resolves to nothing there, the adjustment never applies, and production
     * still measured 0.068 on three runs after the change. The fallback is kept
     * because it does work for readers on macOS and Windows, which is most of
     * them, but it cannot be the whole answer.
     *
     * `display: optional` is. The browser gives each face a short block period
     * and, if it has not arrived, uses the fallback for that page load and
     * swaps nothing — so nothing moves, on any platform, with or without the
     * adjusted metrics. The font still downloads and every later visit is
     * served from cache at full fidelity.
     *
     * The cost is stated rather than hidden: a first visit on a connection too
     * slow to deliver the preloaded faces inside the block period reads that
     * page in Georgia. That is the trade — one visit in the fallback face,
     * against every reader on every platform watching a paragraph reflow
     * mid-sentence. A page that renders in Georgia and holds still is the
     * better read.
     *
     * The files stay in public/fonts because two surfaces need them at a
     * stable, unhashed URL that Astro's pipeline does not provide:
     * public/rss.xsl, which the browser renders outside this build, and
     * src/lib/og.ts, which reads them off disk to draw the social cards. Astro
     * therefore emits a second, hashed copy under /_astro/fonts for the site
     * itself. That duplication is on disk only — no page requests both.     *
     * Only the `latin` subset is declared, though a `latin-ext` file sits beside
     * it in public/fonts. Astro's preload filter matches on subset and the local
     * provider sets none, so `preload` is all-or-nothing: declaring latin-ext
     * puts another 98KB on the critical path. Measured on a local build, twice
     * each — latin-ext declared gave Performance 96 and 97, latin alone gave 99
     * and 99, with Cumulative Layout Shift at 0 either way. Nothing in the
     * repository uses an extended-range character, so it was paying for nothing.
     * The consequence, stated plainly: a future post containing one — a Polish
     * Ł, a Vietnamese ư — renders that character in the metric-matched fallback
     * rather than in Newsreader. A downgrade on one glyph, not a missing glyph.
     * The file is kept rather than deleted so restoring it is one entry here.
     */
    fonts: [
        {
            name: 'JetBrains Mono',
            cssVariable: '--font-mono',
            provider: fontProviders.local(),
            fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
            optimizedFallbacks: true,
            display: 'optional',
            options: {
                variants: [
                    {
                        src: ['./public/fonts/jetbrains-mono-latin.woff2'],
                        weight: '400 700',
                        style: 'normal',
                        unicodeRange: LATIN,
                    },
                ],
            },
        },
        {
            name: 'Newsreader',
            cssVariable: '--font-serif',
            provider: fontProviders.local(),
            fallbacks: ['Georgia', 'Times New Roman', 'serif'],
            optimizedFallbacks: true,
            display: 'optional',
            options: {
                variants: [
                    {
                        src: ['./public/fonts/newsreader-latin.woff2'],
                        weight: '400 700',
                        style: 'normal',
                        unicodeRange: LATIN,
                    },
                ],
            },
        },
    ],

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
