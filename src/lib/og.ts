/**
 * Open Graph card images, generated at build time.
 *
 * The site had no `og:image` at all, so every share of it was a grey box of
 * text. These are how the blog looks where readers actually meet it first,
 * which for this site is a LinkedIn feed — see docs/LINKEDIN.md.
 *
 * Two build-time dependencies and no runtime cost: the images are files in
 * `dist`, and nothing here reaches the browser. `wawoff2` decompresses the
 * committed woff2 subset, because the site self-hosts woff2 and no rasteriser
 * reads that format; `@resvg/resvg-js` turns the SVG below into a PNG.
 *
 * The card is set entirely in JetBrains Mono, which is both the site's title
 * face and the reason no layout engine is needed here: a monospace advance
 * makes line breaking arithmetic rather than measurement, so satori and its
 * dependency tree buy nothing.
 */
import { decompress } from 'wawoff2';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const W = 1200;
const H = 630;
const PAD = 72;
const INNER = W - PAD * 2;

/** The light palette, from tokens.css. A feed has no prefers-color-scheme. */
const C = {
    ink: '#17191C',
    paper: '#F5F5F2',
    rule: '#D8DAD5',
    muted: '#4D514D',
    faint: '#6B6F6A',
    ok: '#2F5D50',
    info: '#2C5578',
    warn: '#8C5A2B',
} as const;

/** Status hues, exactly as the site uses them. `experiment` stays uncoloured. */
const STATUS: Record<string, string> = {
    shipped: C.ok,
    'still-running': C.info,
    abandoned: C.warn,
    experiment: C.muted,
};

/**
 * JetBrains Mono advances 0.6em per glyph. With the -0.03em tracking the site
 * sets on titles, one character occupies 0.57em — so a line's capacity is exact
 * and needs no measuring.
 */
const ADVANCE = 0.6;
const TRACK_TITLE = -0.03;
const charsPerLine = (size: number, trackEm: number) =>
    Math.floor(INNER / (size * (ADVANCE + trackEm)));

const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Greedy wrap. A word longer than a line is hard-split rather than overflowing. */
function wrap(text: string, size: number, trackEm = TRACK_TITLE): string[] {
    const max = charsPerLine(size, trackEm);
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
        if (!line.length) {
            line = word;
        } else if (line.length + 1 + word.length <= max) {
            line += ' ' + word;
        } else {
            lines.push(line);
            line = word;
        }
        while (line.length > max) {
            lines.push(line.slice(0, max));
            line = line.slice(max);
        }
    }
    if (line.length) lines.push(line);
    return lines;
}

/** Step the type down until the title fits in three lines. */
function fitTitle(title: string): { size: number; lines: string[] } {
    for (const size of [64, 56, 48, 42]) {
        const lines = wrap(title, size);
        if (lines.length <= 3) return { size, lines };
    }
    const size = 42;
    return { size, lines: wrap(title, size).slice(0, 3) };
}

/*
 * resvg renders the variable font's default instance and ignores `font-weight`,
 * so the wordmark's weight contrast has to be synthesised: a stroke in the fill
 * colour thickens the glyph by half its width on each side. `bold` is that,
 * expressed in pixels of stroke.
 */
const text = (
    x: number,
    y: number,
    s: string,
    opts: { size: number; fill: string; tracking?: number; bold?: number },
) =>
    `<text x="${x}" y="${y}" font-family="JetBrains Mono" font-size="${opts.size}" ` +
    `fill="${opts.fill}"` +
    (opts.tracking ? ` letter-spacing="${opts.tracking}"` : '') +
    (opts.bold
        ? ` stroke="${opts.fill}" stroke-width="${opts.bold}" paint-order="stroke fill"`
        : '') +
    `>${esc(s)}</text>`;

const rule = (x: number, y: number, w: number, fill = C.rule) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${w > 0 ? 1.5 : 0}" fill="${fill}"/>`;

export interface PostCard {
    kind: 'post';
    title: string;
    date: string;
    status: string;
    archetype: string;
}
export interface HomeCard {
    kind: 'home';
    name: string;
    line: string;
}
export type Card = PostCard | HomeCard;

function cardSVG(card: Card): string {
    const parts: string[] = [`<rect width="${W}" height="${H}" fill="${C.paper}"/>`];

    if (card.kind === 'post') {
        // Kicker, and the hairline that runs from the end of the label to the
        // edge of the measure — the index kicker, at poster size.
        const kick = `${card.date.toUpperCase()}  ·  ${card.status.toUpperCase()}`;
        const kickW = kick.length * 24 * 0.6 + 24 * 0.08 * kick.length;
        parts.push(text(PAD, 108, kick, { size: 24, fill: C.faint, tracking: 24 * 0.08 }));
        parts.push(rule(PAD + kickW + 24, 100, Math.max(0, INNER - kickW - 24)));

        const { size, lines } = fitTitle(card.title);
        const lh = Math.round(size * 1.18);
        const last = 452;
        const start = last - (lines.length - 1) * lh;
        lines.forEach((l, i) =>
            parts.push(
                text(PAD, start + i * lh, l, {
                    size,
                    fill: C.ink,
                    tracking: size * TRACK_TITLE,
                }),
            ),
        );

        parts.push(rule(PAD, 512, INNER));
        parts.push(text(PAD, 566, 'andredreyer.com', { size: 24, fill: C.faint }));
        const arch = card.archetype.replace(/-/g, ' ').toUpperCase();
        const archW = arch.length * 24 * 0.68;
        parts.push(
            text(W - PAD - archW, 566, arch, {
                size: 24,
                fill: STATUS[card.status] ?? C.muted,
                tracking: 24 * 0.08,
            }),
        );
    } else {
        // The wordmark, at poster size: the given name carries the weight.
        const nameSize = 84;
        const track = nameSize * -0.035;
        const [first, ...restWords] = card.name.split(' ');
        const rest = restWords.join(' ');
        // The advance of the given name plus the space that follows it. SVG
        // collapses leading whitespace in <text>, so the gap is positional.
        const firstW = (first.length + 1) * (nameSize * (ADVANCE - 0.035));
        parts.push(text(PAD, 250, first, { size: nameSize, fill: C.ink, tracking: track, bold: 2.2 }));
        parts.push(text(PAD + firstW, 250, rest, { size: nameSize, fill: C.ink, tracking: track }));

        const lh = 44;
        wrap(card.line, 30, 0)
            .slice(0, 3)
            .forEach((l, i) => parts.push(text(PAD, 348 + i * lh, l, { size: 30, fill: C.muted })));

        parts.push(rule(PAD, 512, INNER));
        parts.push(text(PAD, 566, 'andredreyer.com', { size: 24, fill: C.faint }));
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;
}

let fontCache: string[] | null = null;

/**
 * Decompressed once per build and handed to resvg as file paths.
 *
 * Not as buffers: resvg-js 2.6.2 accepts `fontBuffers` and then silently
 * renders no text at all — every glyph disappears and the PNG is still valid,
 * so it fails as blank images rather than as an error. `fontFiles` works.
 */
async function fonts(): Promise<string[]> {
    if (fontCache) return fontCache;
    /*
     * The `latin` subset only. Registering `latin-ext` alongside it gives resvg
     * two faces claiming the same family, and it picks one for the whole run —
     * which came out as latin-ext, rendering every lowercase glyph as .notdef.
     *
     * Nothing is lost. That subset's unicode-range covers U+0000-00FF and
     * U+2000-206F, so an accented name, an em dash and curly quotes all set.
     */
    const sources = ['public/fonts/jetbrains-mono-latin.woff2'];
    const dir = mkdtempSync(join(tmpdir(), 'og-fonts-'));
    fontCache = await Promise.all(
        sources.map(async (src) => {
            const out = join(dir, src.split('/').pop()!.replace('.woff2', '.ttf'));
            writeFileSync(out, Buffer.from(await decompress(readFileSync(src))));
            return out;
        }),
    );
    return fontCache;
}

export async function renderCard(card: Card): Promise<Buffer> {
    const resvg = new Resvg(cardSVG(card), {
        fitTo: { mode: 'original' },
        font: {
            fontFiles: await fonts(),
            loadSystemFonts: false,
            defaultFontFamily: 'JetBrains Mono',
        },
    });
    return Buffer.from(resvg.render().asPng());
}

export const OG_SIZE = { width: W, height: H };
