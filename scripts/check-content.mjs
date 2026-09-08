/**
 * Refuses a build that ships scaffolding.
 *
 * `[[TK: …]]` is the repository's marker for a value that is needed and not yet
 * known, and `.placeholder` is the style that makes drafting scaffolding
 * conspicuous. Both are working conventions. Neither is for readers.
 *
 * They reached production: `/about` served the sentence "Placeholder.
 * Scaffolding, not André's writing — replace the paragraph below before this
 * site is shared anywhere" on a live site with Open Graph cards generated for
 * sharing, on the one page a reader visits to decide whether to trust the rest.
 * A reminder in a document did not catch it for however long it was live. A
 * guard does, every time, in under a second.
 *
 * Drafts need no special case: `getPosts()` filters them out, so `dist` only
 * ever contains pages that are meant to be public.
 *
 * One exemption, and it is not a loophole. `<Artefact>` is this site's device
 * for quoting evidence verbatim, and one published post quotes its own drafting
 * scaffolding as the artefact — its caption reads "complete and unedited … The
 * markers are the drafting tool's way of recording a fact it was not given."
 * A marker in prose is a leak; a marker inside an artefact is the subject. So
 * artefact figures are removed before scanning, and nothing else is.
 *
 *     pnpm build && pnpm check:content
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';

/** Patterns that must never appear in a built page, with why they are banned. */
const BANNED = [
    { id: 'tk-marker', re: /\[\[TK:[^\]]*\]\]/g, why: 'an unresolved [[TK:]] marker' },
    { id: 'placeholder-class', re: /class="[^"]*\bplaceholder\b[^"]*"/g, why: 'drafting scaffolding (.placeholder)' },
];

function pages(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = join(dir, e.name);
        return e.isDirectory() ? pages(p) : e.name.endsWith('.html') ? [p] : [];
    });
}

let failures = 0;
const files = pages(DIST).sort();

/** Artefact figures quote evidence verbatim; their contents are not scaffolding. */
const stripArtefacts = (html) =>
    html.replace(/<figure class="artefact[^"]*"[\s\S]*?<\/figure>/g, '');

for (const file of files) {
    const html = stripArtefacts(readFileSync(file, 'utf8'));
    for (const { re, why } of BANNED) {
        for (const m of html.matchAll(re)) {
            failures++;
            // A little context, so the offending page is obvious without opening it.
            const at = Math.max(0, m.index - 60);
            const context = html
                .slice(at, m.index + m[0].length + 60)
                .replace(/\s+/g, ' ')
                .trim();
            console.log(`✗ ${relative(DIST, file)} — ${why}`);
            console.log(`  …${context}…\n`);
        }
    }
}

console.log(
    failures === 0
        ? `Clean — ${files.length} pages carry no scaffolding.`
        : `${failures} scaffolding marker${failures === 1 ? '' : 's'} in the build. These are not for readers.`,
);
process.exit(failures === 0 ? 0 : 1);
