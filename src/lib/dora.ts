import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/**
 * The four DORA metrics for the footer, computed from git history at build time.
 *
 * Two of them are real and two are not, and the line says so rather than
 * quietly dropping the labels. Change failure rate and time to restore need
 * deployment outcomes from the Vercel API, which is out of scope for v1; they
 * render as an em dash. An em dash also appears wherever git cannot answer
 * honestly — a truncated clone, a repository with no merges, no repository at
 * all. Nothing here guesses, and nothing here throws: a build must not fail
 * because a footer could not be computed.
 */

export interface Dora {
    deployFrequency: string;
    leadTime: string;
    changeFailureRate: string;
    timeToRestore: string;
}

const UNKNOWN = '—';
const WINDOW_DAYS = 90;
const DAYS_PER_MONTH = 30.437; // mean Gregorian month
const MS_PER_DAY = 86_400_000;
const DEEPEN_TIMEOUT_MS = 60_000;

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
 * Whether the history reachable from `ref` covers the window being measured.
 *
 * A shallow clone is not automatically untrustworthy, which is the distinction
 * this used to miss. Vercel builds from one, and a repository younger than the
 * window fits inside it whole: the oldest commit reachable is the real root,
 * nothing is missing, and the counts over the window are exact. Comparing that
 * commit's date against the window start cannot tell a young project from a
 * truncated one, so it reported every young project as unmeasurable — and would
 * have gone on doing so once the project aged past the window, because a
 * depth-limited clone does not reach back that far either.
 *
 * What actually matters is whether the oldest commit is a graft.
 */
function historyCoversWindow(ref: string, since: Date): boolean {
    const log = lines(git(['log', ref, '--first-parent', '--format=%H %cI']));
    if (log.length === 0) return false;

    const [sha, date] = log[log.length - 1]!.split(' ');
    if (!sha || !date) return false;

    // Reaches back past the window, so nothing inside the window is missing.
    if (new Date(date).getTime() < since.getTime()) return true;

    // Otherwise it covers the window only if it starts at the beginning of the
    // project rather than at the point a shallow fetch stopped.
    return !shallowBoundary().has(sha);
}

/**
 * Ask the remote for the rest of the history, when the clone has been cut short.
 *
 * Vercel builds from a truncated clone, which is why this is needed at all: the
 * window is 90 days and the clone holds a handful of commits, so every metric
 * below would correctly refuse to answer. One fetch turns that into a real
 * measurement.
 *
 * Best effort by design. A private repository, an offline builder or a slow
 * remote all leave the clone as it was, and the metrics then report an em dash
 * exactly as they would have. It must never fail a build, so it is bounded by a
 * timeout and its errors are swallowed like every other call here.
 */
function deepen(): void {
    if (git(['rev-parse', '--is-shallow-repository']) !== 'true') return;
    git(['fetch', '--unshallow', '--quiet'], DEEPEN_TIMEOUT_MS);
}

/** `45m`, `3h 12m`, `2d 4h`. */
function formatDuration(ms: number): string {
    const minutes = Math.round(ms / 60_000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

function median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Commits landing on main over the trailing 90 days, expressed per month.
 *
 * `--first-parent` counts each merge as one landing rather than counting every
 * commit the branch carried in.
 */
function deployFrequency(ref: string, since: Date): string {
    const all = lines(git(['log', ref, '--first-parent', '--format=%cI']));
    if (all.length === 0) return UNKNOWN;

    const landed = all.filter((iso) => new Date(iso).getTime() >= since.getTime()).length;
    return `${((landed / WINDOW_DAYS) * DAYS_PER_MONTH).toFixed(1)}/mo`;
}

/**
 * Median time from the first commit on a branch to the merge that put it on
 * main, over the same trailing 90 days.
 *
 * Only merge commits can be measured this way. A repository that squashes or
 * rebases keeps no record of when the branch started, so those landings are not
 * counted; if none can be measured the metric is unknown rather than zero.
 */
function leadTime(ref: string, since: Date): string {
    const merges = lines(
        git(['log', ref, '--first-parent', '--merges', `--since=${since.toISOString()}`, '--format=%H %cI']),
    );

    const samples: number[] = [];
    for (const line of merges) {
        const [sha, mergedAt] = line.split(' ');
        if (!sha || !mergedAt) continue;

        const parents = git(['rev-list', '--parents', '-n', '1', sha])?.split(' ').slice(1) ?? [];
        if (parents.length < 2) continue;

        const base = git(['merge-base', parents[0]!, parents[1]!]);
        if (!base) continue;

        // Oldest commit unique to the branch.
        const branchCommits = lines(git(['log', `${base}..${parents[1]}`, '--format=%aI']));
        const first = branchCommits[branchCommits.length - 1];
        if (!first) continue;

        const elapsed = new Date(mergedAt).getTime() - new Date(first).getTime();
        if (Number.isFinite(elapsed) && elapsed >= 0) samples.push(elapsed);
    }

    return samples.length > 0 ? formatDuration(median(samples)) : UNKNOWN;
}

let cached: Dora | undefined;

/** Computed once per build. Every page renders the same line. */
export function getDora(): Dora {
    if (cached) return cached;

    // Change failure rate and time to restore need deployment outcomes, which
    // only Vercel knows. Out of scope for v1, and not something to invent.
    const unavailable = { changeFailureRate: UNKNOWN, timeToRestore: UNKNOWN };

    const ref = mainRef();
    if (!ref) {
        cached = { deployFrequency: UNKNOWN, leadTime: UNKNOWN, ...unavailable };
        return cached;
    }

    deepen();

    const since = new Date(Date.now() - WINDOW_DAYS * MS_PER_DAY);

    // Both metrics measure the same window, so a history that does not cover it
    // makes both wrong in the same way. Lead time used to be exempt from this
    // check and reported a median over whatever a truncated fetch happened to
    // include, which reads as a measurement rather than as a fragment of one.
    if (!historyCoversWindow(ref, since)) {
        cached = { deployFrequency: UNKNOWN, leadTime: UNKNOWN, ...unavailable };
        return cached;
    }

    cached = {
        deployFrequency: deployFrequency(ref, since),
        leadTime: leadTime(ref, since),
        ...unavailable,
    };
    return cached;
}
