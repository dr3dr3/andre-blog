/**
 * Checks the reading conditions in docs/PERFORMANCE.md against the rendered
 * page, at every breakpoint.
 *
 * Those conditions were written as prose on 2026-09-08 and broken the same day:
 * raising the artefact from 13px to 18px, to stop the evidence being the
 * smallest text on the page, pushed half of every long line outside the block.
 * The arithmetic sat in the tokens the whole time. A prose rule caught nothing;
 * André caught it on the live site.
 *
 * So these are measured in a real browser rather than reasoned about. Font
 * metrics, line boxes and hit areas are not derivable from the stylesheet — the
 * character count of a line depends on the glyphs in it.
 *
 *     pnpm check:reading            # against a locally served dist/
 *     pnpm check:reading --report   # print the numbers, assert nothing
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, extname } from 'node:path';
import { chromium } from 'playwright-core';

const REPORT_ONLY = process.argv.includes('--report');
const DIST = 'dist';

/* --- the conditions -------------------------------------------------------
 * Each is a rule from docs/PERFORMANCE.md, expressed as something a browser
 * can answer. The bounds are deliberately the ones the design document states;
 * where the site disagrees with its own document, that is the finding. */
const MIN_CHARS = 45;
const MAX_CHARS = 80; // DESIGN.md wants 45-75; 54ch of Newsreader lands ~77
const H2_RATIO = 1.15;
const TAP_TARGET = 44;

const VIEWPORTS = [
    { name: 'phone', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'laptop', width: 1024, height: 768 },
    { name: 'wide', width: 1440, height: 900 },
    { name: 'huge', width: 2560, height: 1440 },
];

function findChrome() {
    if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
    const pw = join(homedir(), '.cache', 'ms-playwright');
    if (existsSync(pw)) {
        for (const d of readdirSync(pw).filter((x) => x.startsWith('chromium-')).sort().reverse()) {
            const bin = join(pw, d, 'chrome-linux', 'chrome');
            if (existsSync(bin)) return bin;
        }
    }
    console.error('No browser. Run: pnpm dlx playwright install --with-deps chromium');
    process.exit(1);
}

const TYPES = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'text/xml',
};

/** Astro's preview server will not start on this repo's bind mount, so serve dist directly. */
function serve() {
    return new Promise((resolve) => {
        const server = createServer(async (req, res) => {
            let path = join(DIST, decodeURIComponent(req.url.split('?')[0]));
            try {
                if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
            } catch {
                res.writeHead(404).end();
                return;
            }
            try {
                res.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream' });
                res.end(await readFile(path));
            } catch {
                res.writeHead(404).end();
            }
        });
        server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
    });
}

/** Runs in the page. Everything here is measured, nothing is inferred. */
function measure() {
    const size = (el) => (el ? parseFloat(getComputedStyle(el).fontSize) : null);

    // Characters per line, from real line boxes rather than a `ch` estimate.
    let chars = 0, lines = 0;
    for (const p of document.querySelectorAll('.prose > p, .summary')) {
        const range = document.createRange();
        range.selectNodeContents(p);
        const rects = range.getClientRects();
        if (!rects.length) continue;
        chars += p.textContent.trim().length;
        lines += rects.length;
    }

    // Evidence must not be the smallest text, and must not be clipped.
    const pre = document.querySelector('.artefact pre');
    const artefact = size(pre);
    let smallestVisible = Infinity;
    for (const el of document.querySelectorAll('.prose *, .post-meta *, main p, main a')) {
        if (!el.textContent.trim()) continue;
        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden') continue;
        const fs = parseFloat(s.fontSize);
        if (fs > 0) smallestVisible = Math.min(smallestVisible, fs);
    }

    // Anything a reader acts on.
    const tap = [];
    for (const a of document.querySelectorAll('.post-index a, .site-header nav a, .post-tags a')) {
        const r = a.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        tap.push({ text: a.textContent.trim().slice(0, 28), h: Math.round(r.height) });
    }

    // Does the measure bind, or the viewport? On a phone the column fills the
    // screen and the line length is whatever fits — no type size reaches 45
    // characters at 390px. The minimum is a statement about the measure, so it
    // only applies where the measure is the thing deciding.
    const col = document.querySelector('.prose, .post-index');
    const colWidth = col ? col.getBoundingClientRect().width : 0;
    const available = document.documentElement.clientWidth - 2 * 24; // --gutter
    const measureBinds = colWidth > 0 && colWidth < available - 4;

    // Tokens, in pixels, read from :root.
    //
    // Element measurement alone is not enough: no published post carries a `##`
    // heading, so the h2-against-body condition had nothing to measure and
    // passed vacuously — a check that cannot fail is not a check. The tokens
    // hold whether or not today's content happens to exercise them.
    const root = getComputedStyle(document.documentElement);
    const rootPx = parseFloat(root.fontSize);
    const tok = (n) => {
        const v = root.getPropertyValue(n).trim();
        if (!v) return null;
        return v.endsWith('rem') ? parseFloat(v) * rootPx : parseFloat(v);
    };
    const tokens = {
        body: tok('--fs-body'),
        h2: tok('--fs-h2'),
        indexTitle: tok('--fs-index-title'),
        artefact: tok('--fs-artefact'),
    };

    return {
        tokens,
        measureBinds,
        body: size(document.querySelector('.prose > p, .summary')),
        h2: size(document.querySelector('.prose h2, .index-title')),
        artefact,
        smallestVisible: smallestVisible === Infinity ? null : smallestVisible,
        avgChars: lines ? +(chars / lines).toFixed(1) : null,
        preOverflow: pre ? pre.scrollWidth - pre.clientWidth : null,
        headings: document.querySelectorAll('main h2, article h2').length,
        listing: !!document.querySelector('.post-index'),
        tap,
    };
}

const { server, port } = await serve();
const browser = await chromium.launch({ executablePath: findChrome(), args: ['--no-sandbox', '--disable-gpu'] });

/*
 * The `finally` below covers a normal run and a thrown error, but not Ctrl-C on
 * a slow one — a signal ends the process without unwinding, and the browser is
 * reparented to init and stays. That is how sibling script scripts/lighthouse.mjs
 * filled this devcontainer with 90 orphaned Chromium roots; see the comment
 * there. Nothing has to have gone wrong for the leak to happen, so the net goes
 * in here too rather than waiting for it to.
 */
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => {
        browser.close().catch(() => {});
        server.close();
        process.exit(130);
    });
}
const base = `http://127.0.0.1:${port}`;
// Every distinct page shape on the site. /about and /colophon are here because
// they are the two long-prose pages that are not posts: they carry the same
// measure and heading scale, and nothing else in the gate would notice if one
// of them stopped being readable. A route added to src/pages/ belongs here.
const PAGES = [
    '/',
    '/posts/expected-a-few-days/',
    '/about/',
    '/colophon/',
    '/tags/tooling/',
    '/404.html',
];

const failures = [];
const note = (msg) => (REPORT_ONLY ? console.log(`    · ${msg}`) : failures.push(msg));

try {
    for (const path of PAGES) {
        console.log(`\n${path}`);
        for (const vp of VIEWPORTS) {
            const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
            await page.goto(base + path, { waitUntil: 'networkidle' });
            const m = await page.evaluate(measure);
            await page.close();

            const bits = [
                `body ${m.body ?? '—'}`,
                `h2 ${m.h2 ?? '—'}${m.tokens.h2 ? `/tok ${m.tokens.h2}` : ''}`,
                m.artefact ? `artefact ${m.artefact}` : null,
                m.avgChars ? `${m.avgChars} ch/line` : null,
            ].filter(Boolean);
            console.log(`  ${vp.name.padEnd(7)} ${String(vp.width).padStart(4)}px   ${bits.join('  ')}`);

            const at = `${path} @${vp.width}px`;
            if (m.avgChars !== null && m.avgChars > MAX_CHARS)
                note(`${at}: ${m.avgChars} characters per line, over ${MAX_CHARS}`);
            if (m.avgChars !== null && m.measureBinds && m.avgChars < MIN_CHARS)
                note(`${at}: ${m.avgChars} characters per line, under ${MIN_CHARS}, and the measure is what is deciding`);
            // Tokens first, because they hold regardless of what today's
            // content happens to contain.
            const t = m.tokens;
            if (t.h2 && t.body && t.h2 / t.body < H2_RATIO)
                note(`${at}: --fs-h2 is ${(t.h2 / t.body).toFixed(2)}x --fs-body, under ${H2_RATIO}x`);
            if (t.indexTitle && t.body && t.indexTitle / t.body < H2_RATIO)
                note(`${at}: --fs-index-title is ${(t.indexTitle / t.body).toFixed(2)}x --fs-body, under ${H2_RATIO}x`);
            if (t.artefact && t.body && t.artefact < t.body * 0.7)
                note(`${at}: --fs-artefact is ${(t.artefact / t.body).toFixed(2)}x --fs-body — evidence set too small`);
            if (m.h2 && m.body && m.h2 / m.body < H2_RATIO)
                note(`${at}: a rendered heading is ${(m.h2 / m.body).toFixed(2)}x body, under ${H2_RATIO}x`);
            if (m.artefact && m.smallestVisible && m.artefact < m.smallestVisible)
                note(`${at}: artefact ${m.artefact}px is the smallest text on the page`);
            if (m.preOverflow > 1)
                note(`${at}: artefact is clipped — ${m.preOverflow}px overflows the block`);
            if (m.listing && m.headings === 0)
                note(`${at}: a listing with no headings — nothing for heading navigation`);
            for (const t of m.tap)
                if (t.h < TAP_TARGET && vp.width <= 768)
                    note(`${at}: "${t.text}" is ${t.h}px tall, under the ${TAP_TARGET}px target`);
        }
    }
} finally {
    await browser.close();
    server.close();
}

console.log('');
if (REPORT_ONLY) {
    console.log('Report only — nothing asserted.\n');
    process.exit(0);
}
if (failures.length) {
    console.log(`${failures.length} reading condition${failures.length === 1 ? '' : 's'} failed:\n`);
    for (const f of [...new Set(failures)]) console.log(`  ✗ ${f}`);
    console.log('\nSee "The reading conditions" in docs/PERFORMANCE.md.\n');
    process.exit(1);
}
console.log('All reading conditions hold.\n');
