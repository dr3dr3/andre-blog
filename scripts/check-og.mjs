/**
 * Verifies the social cards in `dist`, after a build.
 *
 * The failures this catches are the ones that are invisible until a link is
 * already posted: a page with no card, a relative `og:image` that a scraper
 * cannot resolve, a tag pointing at a file the build did not emit, or an image
 * that is not 1200x630. It also renders the tags per page so they can be read
 * at a glance rather than grepped out of minified HTML.
 *
 * What it cannot tell you is whether LinkedIn will show the card, because that
 * depends on LinkedIn's cache. See docs/DESIGN.md, "Social cards".
 *
 *     pnpm build && pnpm check:og
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const SITE = 'https://andredreyer.com';
const REQUIRED = [
    'og:title',
    'og:description',
    'og:url',
    'og:type',
    'og:site_name',
    'og:image',
    'og:image:width',
    'og:image:height',
    'og:image:alt',
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image',
];

function htmlFiles(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = join(dir, e.name);
        return e.isDirectory() ? htmlFiles(p) : e.name.endsWith('.html') ? [p] : [];
    });
}

/** Width and height out of a PNG's IHDR, which is always the first chunk. */
function pngSize(file) {
    const b = readFileSync(file);
    if (b.length < 24 || b.toString('ascii', 1, 4) !== 'PNG') return null;
    if (b.toString('ascii', 12, 16) !== 'IHDR') return null;
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

const tagsIn = (html) => {
    const out = {};
    for (const m of html.matchAll(
        // `_` matters: og:site_name is the only tag here that carries one, and
        // a character class without it silently reports the tag as missing.
        /<meta\s+(?:property|name)="((?:og|twitter):[a-z_:]+)"\s+content="([^"]*)"\s*\/?>/g,
    )) {
        out[m[1]] = m[2];
    }
    return out;
};

let failures = 0;
const fail = (msg) => {
    failures++;
    console.log(`  ✗ ${msg}`);
};

const pages = htmlFiles(DIST).sort();
console.log(`Checking ${pages.length} pages in ${DIST}/\n`);

const imagesSeen = new Set();

for (const page of pages) {
    const rel = relative(DIST, page);
    const tags = tagsIn(readFileSync(page, 'utf8'));
    const missing = REQUIRED.filter((t) => !tags[t]);
    const img = tags['og:image'];

    console.log(`${rel}`);
    console.log(`  image  ${img ?? '(none)'}`);
    console.log(`  title  ${tags['og:title'] ?? '(none)'}`);

    if (missing.length) fail(`missing: ${missing.join(', ')}`);

    if (img) {
        if (!img.startsWith('http')) {
            fail(`og:image is not absolute — a scraper cannot resolve it: ${img}`);
        } else if (!img.startsWith(SITE)) {
            fail(`og:image points off-site: ${img}`);
        } else {
            const local = join(DIST, img.slice(SITE.length));
            if (!existsSync(local)) {
                fail(`og:image has no file in the build: ${local}`);
            } else {
                imagesSeen.add(local);
                const size = pngSize(local);
                if (!size) fail(`og:image is not a readable PNG: ${local}`);
                else if (size.width !== 1200 || size.height !== 630) {
                    fail(`og:image is ${size.width}x${size.height}, expected 1200x630`);
                } else if (
                    tags['og:image:width'] !== '1200' ||
                    tags['og:image:height'] !== '630'
                ) {
                    fail(`og:image:width/height disagree with the file`);
                } else {
                    const kb = (statSync(local).size / 1024).toFixed(1);
                    console.log(`  ok     ${size.width}x${size.height}, ${kb}KB`);
                }
            }
        }
    }
    if (tags['twitter:image'] && tags['twitter:image'] !== img) {
        fail('twitter:image and og:image disagree');
    }
    console.log('');
}

// A card nothing points at is dead weight, and usually a wiring mistake.
const emitted = existsSync(join(DIST, 'og'))
    ? readdirSync(join(DIST, 'og')).map((f) => join(DIST, 'og', f))
    : [];
for (const f of emitted) {
    if (!imagesSeen.has(f)) fail(`${f} is generated but no page references it`);
}

console.log(
    failures === 0
        ? `All good — ${pages.length} pages, ${imagesSeen.size} distinct cards.`
        : `${failures} problem${failures === 1 ? '' : 's'}.`,
);
process.exit(failures === 0 ? 0 : 1);
