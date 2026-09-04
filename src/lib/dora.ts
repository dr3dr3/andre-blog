import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/**
 * The four numbers in the site footer, computed from git history at build time.
 *
 * [docs/METRICS.md](../../docs/METRICS.md) is the specification; this file is
 * only its implementation, and where the two disagree the document wins. The
 * metrics keep the DORA shape because the audience recognises it, but only the
 * first still measures software delivery — the other three were re-pointed at
 * the thing this site actually produces, which is writing.
 *
 * Nothing here guesses and nothing here throws. A number that cannot be computed
 * honestly renders as an em dash, which means *not available* rather than zero,
 * and a build must never fail because a footer could not be worked out.
 */

export interface PostSamples {
    draftToLive: number;
    published: number;
    revised: number;
}

export interface Dora {
    /** Changes landing on `main`, per month. `4.1/mo` */
    deployFrequency: string;
    /** How long a post takes from first appearing in the repository to publication. `3d` */
    draftToLive: string;
    /** Share of published posts that needed changing afterwards. `12%` */
    revised: string;
    /** How long a post stood unrevised before the first change landed. `9d` */
    timeToRevise: string;
    /**
     * How many posts each figure rests on, for the colophon to disclose. The
     * footer is gated at three, so a reader needs somewhere to find out that a
     * number rests on four posts.
     *
     * Null when the archive could not be read at all. Zero would be a claim —
     * that there are no published posts — and rule 2 of docs/METRICS.md is that
     * an unavailable number never renders as zero. That applies to the counts
     * behind the figures exactly as it applies to the figures.
     */
    samples: PostSamples | null;
}

/** Exported so the footer can tell a missing value from a measured one and
 * tone it down, rather than comparing against a literal dash of its own. */
export const UNKNOWN = '—';
const WINDOW_DAYS = 90;
const DAYS_PER_MONTH = 30.437; // mean Gregorian month
const MS_PER_DAY = 86_400_000;
const DEEPEN_TIMEOUT_MS = 60_000;

/** Rule 5: a median of one is the value itself and a median of two is a midpoint. */
const SAMPLE_GATE = 3;

const POSTS_DIR = 'src/content/posts';

/** Run git and return trimmed stdout, or null if git fails for any reason. */
function git(args: string[], timeout?: number): string | null {
    try {
        const out = execFileSync('git', args, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            cwd: process.cwd(),
            timeout,
        });
        return out.trim();
    } catch {
        return null;
    }
}

function lines(out: string | null): string[] {
    return out ? out.split('\n').filter(Boolean) : [];
}

/**
 * One line of build-time diagnostics, on stderr.
 *
 * Every git call here swallows its errors so that a footer can never fail a
 * build. That also means a footer full of em dashes looks identical whether the
 * clone was truncated, the remote was unreachable or git was absent altogether.
 * The build log is the only place that distinction can surface, so the decisions
 * narrate themselves there.
 *
 * Build-time only. Nothing here reaches the page.
 */
function note(message: string): void {
    console.warn(`[dora] ${message}`);
}

/**
 * The ref that stands in for `main`. A local branch when one exists, the remote
 * branch when the clone is detached (which is how Vercel checks out a build),
 * and HEAD as a last resort.
 */
function mainRef(): string | null {
    for (const ref of ['refs/heads/main', 'refs/remotes/origin/main']) {
        if (git(['rev-parse', '--verify', '--quiet', ref])) return ref;
    }
    return git(['rev-parse', '--verify', '--quiet', 'HEAD']) ? 'HEAD' : null;
}

/**
 * The commits where a shallow fetch stopped, as recorded in .git/shallow. These
 * look parentless to git even though the project continues past them, which is
 * what makes them indistinguishable from a real root commit without this list.
 *
 * Empty for a full clone, and empty when the file cannot be read.
 */
function shallowBoundary(): Set<string> {
    const path = git(['rev-parse', '--git-path', 'shallow']);
    if (!path) return new Set();

    try {
        return new Set(readFileSync(path, 'utf8').split('\n').filter(Boolean));
    } catch {
        // The usual case: the clone is not shallow, so the file does not exist.
        return new Set();
    }
}

/**
 * Ask the remote for the rest of the history, when the clone has been cut short.
 *
 * Vercel builds from a truncated clone, which is why this is needed at all.
 * Metric 1 measures a trailing window and metrics 2 to 4 measure the whole
 * archive, so between them they need every commit the project has.
 *
 * Best effort by design. A private repository, an offline builder or a slow
 * remote all leave the clone as it was, and the metrics then report em dashes.
 * It must never fail a build, so it is bounded by a timeout and its error is
 * caught — but not silently, because an unexplained footer of em dashes is what
 * sent us reading build logs in the first place.
 */
function deepen(): void {
    if (git(['rev-parse', '--is-shallow-repository']) !== 'true') {
        note('clone is not shallow; no fetch needed');
        return;
    }

    // stderr is piped here, unlike every other call in this file, because the
    // reason this particular fetch failed is the whole diagnostic.
    try {
        execFileSync('git', ['fetch', '--unshallow', '--quiet'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
            cwd: process.cwd(),
            timeout: DEEPEN_TIMEOUT_MS,
        });
        note('clone was truncated; fetch --unshallow landed');
    } catch (err) {
        const { stderr, message } = err as { stderr?: string; message?: string };
        note(
            `clone was truncated and fetch --unshallow did not land: ${stderr?.trim() || message || String(err)}`,
        );
    }
}

/**
 * Whole days between two calendar dates, in UTC.
 *
 * Both metrics that use this span a `published` date and a commit timestamp.
 * `published` carries no time, so subtracting a timestamp from it would claim a
 * precision the field does not have — and would make a post written and
 * published on the same day come out negative, which the impossible-dates
 * exclusion would then throw away as a data error. Comparing the dates alone
 * says exactly what is known and no more.
 */
function daysBetween(from: Date, to: Date): number {
    const midnight = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return Math.round((midnight(to) - midnight(from)) / MS_PER_DAY);
}

/** `3d`, the granularity metrics 2 and 4 are specified in. */
function formatDays(days: number): string {
    return `${Math.round(days)}d`;
}

function median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

/**
 * Metric 1. Changes landing on `main`, per month, over a trailing 90 days.
 *
 * `--first-parent` counts each merge as one landing rather than counting every
 * commit the branch carried in. No sample gate: a count is not a median.
 */
function deployFrequency(ref: string, since: Date): string {
    const all = lines(git(['log', ref, '--first-parent', '--format=%cI']));
    if (all.length === 0) return UNKNOWN;

    const landed = all.filter((iso) => new Date(iso).getTime() >= since.getTime()).length;
    return `${((landed / WINDOW_DAYS) * DAYS_PER_MONTH).toFixed(1)}/mo`;
}

/** The 1-based line of the closing frontmatter delimiter, or null if there is none. */
function frontmatterEnd(source: string | null): number | null {
    if (!source) return null;

    const all = source.split('\n');
    if (all[0]?.trim() !== '---') return null;
    for (let i = 1; i < all.length; i++) {
        if (all[i]?.trim() === '---') return i + 1;
    }
    return null;
}

/** One scalar out of a post's frontmatter, without a YAML parser for two fields. */
function frontmatterField(source: string, key: string): string | null {
    const end = frontmatterEnd(source);
    if (end === null) return null;

    for (const line of source.split('\n').slice(1, end - 1)) {
        const match = new RegExp(`^${key}:\\s*(.+?)\\s*$`).exec(line);
        if (match?.[1]) return match[1].replace(/^['"]|['"]$/g, '');
    }
    return null;
}

interface PostFacts {
    path: string;
    published: Date;
    /** Author date of the commit that added the file, or null if unresolvable. */
    startedAt: Date | null;
    /** Date of the first revision commit after publication, or null if never revised. */
    revisedAt: Date | null;
}

/**
 * Whether a commit revised the writing rather than the bookkeeping.
 *
 * A revision changes at least one line below the closing frontmatter delimiter.
 * Bumping a tag, correcting a stack version or setting `outcome.was` is
 * bookkeeping, and counting it would make metric 3 mean "touched again" rather
 * than "was wrong". Body-only is a mechanical proxy for that distinction and it
 * is not perfect — a repository-wide formatting sweep would still register. The
 * answer if that happens is to record the exception in docs/METRICS.md, not to
 * quietly widen this.
 */
function changesBody(sha: string, path: string): boolean {
    const diff = git(['diff', '-U0', `${sha}^`, sha, '--', path]);
    if (!diff) return false;

    const after = frontmatterEnd(git(['show', `${sha}:${path}`]));
    const before = frontmatterEnd(git(['show', `${sha}^:${path}`]));

    for (const line of diff.split('\n')) {
        const hunk = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
        if (!hunk) continue;

        const removedAt = Number(hunk[1]);
        const removedCount = hunk[2] === undefined ? 1 : Number(hunk[2]);
        const addedAt = Number(hunk[3]);
        const addedCount = hunk[4] === undefined ? 1 : Number(hunk[4]);

        if (removedCount > 0 && before !== null && removedAt > before) return true;
        if (addedCount > 0 && after !== null && addedAt > after) return true;
    }
    return false;
}

/**
 * Everything metrics 2 to 4 need about one post, or null if it is excluded.
 *
 * The exclusions are docs/METRICS.md's: a draft has no publication to measure
 * from, a future-dated post has not happened yet, and a post whose `published`
 * precedes the commit that added its file is a data error that would drag a
 * median below zero.
 */
function postFacts(path: string, buildDate: Date): PostFacts | null {
    let source: string;
    try {
        source = readFileSync(path, 'utf8');
    } catch {
        return null;
    }

    if (frontmatterField(source, 'draft') === 'true') return null;

    const publishedRaw = frontmatterField(source, 'published');
    if (!publishedRaw) return null;

    const published = new Date(publishedRaw);
    if (Number.isNaN(published.getTime())) return null;
    if (published.getTime() > buildDate.getTime()) return null;

    // --follow so a renamed post keeps its original start date; author date
    // because it records when the work happened.
    const added = lines(git(['log', '--diff-filter=A', '--follow', '--format=%aI', '--', path]));
    const oldest = added[added.length - 1];
    const startedAt = oldest ? new Date(oldest) : null;

    // A post published before its file existed is nonsense, not a fast turnaround.
    // Same day is zero rather than negative, and counts.
    if (startedAt && daysBetween(startedAt, published) < 0) return null;

    // The commit that set `draft: false`. publish-post.mjs does that in the same
    // commit that stamps `published`, so the pickaxe finds it unambiguously.
    const publishCommit = lines(
        git(['log', '-S', 'draft: false', '--format=%H', '--reverse', '--', path]),
    )[0];

    let revisedAt: Date | null = null;
    if (publishCommit) {
        for (const sha of lines(
            git(['log', '--format=%H', '--reverse', `${publishCommit}..HEAD`, '--', path]),
        )) {
            if (!changesBody(sha, path)) continue;
            const when = git(['show', '-s', '--format=%cI', sha]);
            if (when) revisedAt = new Date(when);
            break;
        }
    }

    return { path, published, startedAt, revisedAt };
}

/** Every post file git knows about. */
function postPaths(): string[] {
    return lines(git(['ls-files', POSTS_DIR])).filter(
        (p) => p.endsWith('.mdx') || p.endsWith('.md'),
    );
}

let cached: Dora | undefined;

export function getDora(): Dora {
    if (cached) return cached;

    const none: Dora = {
        deployFrequency: UNKNOWN,
        draftToLive: UNKNOWN,
        revised: UNKNOWN,
        timeToRevise: UNKNOWN,
        samples: null,
    };

    const ref = mainRef();
    if (!ref) {
        note('no ref to measure; git is unavailable or this is not a repository');
        cached = none;
        return cached;
    }

    deepen();

    // Rule 4. Metric 1 measures a trailing window and metrics 2 to 4 measure the
    // whole archive, so a history that stops early makes every one of them a
    // fragment presented as a measurement. A graft is what distinguishes a
    // truncated clone from a genuinely young project.
    if (shallowBoundary().size > 0) {
        note('history is still truncated after the fetch; all four metrics report em dashes');
        cached = none;
        return cached;
    }

    const buildDate = new Date();
    const since = new Date(buildDate.getTime() - WINDOW_DAYS * MS_PER_DAY);

    const posts = postPaths()
        .map((path) => postFacts(path, buildDate))
        .filter((p): p is PostFacts => p !== null);

    // Metric 2. Every published post, all time — the corpus is a question about
    // the whole body of work rather than about now. Posts whose start commit
    // cannot be resolved are excluded from this metric only.
    const started = posts.filter((p) => p.startedAt !== null);
    const draftToLive = started.map((p) => daysBetween(p.startedAt!, p.published));

    // Metric 3. Denominator every published post, numerator those revised.
    const revisedPosts = posts.filter((p) => p.revisedAt !== null);

    // Metric 4. Revised posts only. With none it is an em dash, never zero.
    const timeToRevise = revisedPosts.map((p) => daysBetween(p.published, p.revisedAt!));

    const samples = {
        draftToLive: draftToLive.length,
        published: posts.length,
        revised: revisedPosts.length,
    };

    note(
        `samples — draft→live ${samples.draftToLive}, published ${samples.published}, ` +
            `revised ${samples.revised}; gate is ${SAMPLE_GATE}`,
    );

    cached = {
        deployFrequency: deployFrequency(ref, since),
        draftToLive: draftToLive.length >= SAMPLE_GATE ? formatDays(median(draftToLive)) : UNKNOWN,
        revised:
            posts.length >= SAMPLE_GATE
                ? `${Math.round((revisedPosts.length / posts.length) * 100)}%`
                : UNKNOWN,
        timeToRevise: timeToRevise.length >= SAMPLE_GATE ? formatDays(median(timeToRevise)) : UNKNOWN,
        samples,
    };
    return cached;
}
