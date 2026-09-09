/**
 * Cuts the served font files down from the pristine downloads.
 *
 * The originals in `src/fonts` are the Google Fonts `latin` and `latin-ext`
 * subsets as downloaded, and they are the input to this script rather than
 * anything the site serves. `public/fonts` holds the output. Keeping the two
 * apart is what makes this idempotent: running it twice cannot compound,
 * because it never reads its own result.
 *
 * Two cuts, and only the second touches what a reader can see.
 *
 * 1. **The weight axis, clamped to 400–700.** Newsreader ships a 200–800
 *    variable range. The stylesheet asks for 400, 500 and 700 and the
 *    @font-face has always declared `400 700`, so everything outside that was
 *    already unreachable — it was being downloaded and never used. This costs
 *    nothing at all and takes Newsreader down by about a third.
 *
 * 2. **The optical-size axis, clamped to 11–60.** Newsreader's axis runs 6–72.
 *    The smallest type on the site is 11.5px and the largest Newsreader is set
 *    at is `opsz 60`, declared explicitly on the index summary and the masthead
 *    line. Outside that range the axis clamps, which changes the optical cut
 *    very slightly and never breaks a glyph. JetBrains Mono carries no optical
 *    size axis, so this does not apply to it.
 *
 * Glyph coverage is deliberately NOT cut. Dropping unused characters would save
 * another 38% on Newsreader, and it would mean a name with an umlaut in some
 * future post rendering in the fallback face. The bytes are not worth that: the
 * axis clamps give most of the saving and cost nothing a reader will ever meet.
 *
 *     pnpm fonts
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import subsetFont from 'subset-font';

const SOURCE = 'src/fonts';
const OUT = 'public/fonts';

/** Every character the served faces must still cover: printable ASCII, the
 *  whole Latin-1 supplement, and the typographic punctuation this site sets. */
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join('');
const COVERAGE = range(0x20, 0x7e) + range(0xa0, 0xff) + '‐‑–—‘’‚“”„†‡•…‰′″‹›⁄€™−';

/** Only the `latin` subsets are served; see the fonts block in astro.config.mjs. */
const FILES = [
    { file: 'newsreader-latin.woff2', axes: { wght: { min: 400, max: 700 }, opsz: { min: 11, max: 60 } } },
    { file: 'jetbrains-mono-latin.woff2', axes: { wght: { min: 400, max: 700 } } },
];

const kb = (n) => `${(n / 1024).toFixed(1)}KB`;
let before = 0;
let after = 0;

for (const { file, axes } of FILES) {
    const source = readFileSync(`${SOURCE}/${file}`);
    const out = await subsetFont(source, COVERAGE, { targetFormat: 'woff2', variationAxes: axes });
    writeFileSync(`${OUT}/${file}`, out);
    before += source.length;
    after += out.length;
    const saved = (100 * (1 - out.length / source.length)).toFixed(0);
    console.log(`${file.padEnd(28)} ${kb(source.length).padStart(8)} → ${kb(out.length).padStart(8)}  −${saved}%`);
}

console.log(`\nServed faces: ${kb(before)} → ${kb(after)}, ${kb(before - after)} off the critical path.`);
