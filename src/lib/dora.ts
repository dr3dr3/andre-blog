import { execFileSync } from 'node:child_process';

/**
 * The four DORA metrics for the footer, computed from git history at build time.
 *
 * Two of them are real and two are not, and the line says so rather than
 * quietly dropping the labels. Change failure rate and time to restore need
 * deployment outcomes from the Vercel API, which is out of scope for v1; they
 * render as an em dash. An em dash also appears wherever git cannot answer
 * honestly — a shallow clone, a repository with no merges, no repository at
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

/** Run git and return trimmed stdout, or null if git fails for any reason. */
function git(args: string[]): string | null {
    try {
        const out = execFileSync('git', args, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            cwd: process.cwd(),
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

function isShallow(): boolean {
    return git(['rev-parse', '--is-shallow-repository']) === 'true';
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
function deployFrequency(ref: string, since: Date, shallow: boolean): string {
    const all = lines(git(['log', ref, '--first-parent', '--format=%cI']));
    if (all.length === 0) return UNKNOWN;

    // A shallow clone that does not reach back past the window would report a
    // count that is missing commits rather than one that is genuinely low.
    const oldest = all[all.length - 1]!;
    if (shallow && new Date(oldest).getTime() > since.getTime()) return UNKNOWN;

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

    const since = new Date(Date.now() - WINDOW_DAYS * MS_PER_DAY);
    const shallow = isShallow();

    cached = {
        deployFrequency: deployFrequency(ref, since, shallow),
        leadTime: leadTime(ref, since),
        ...unavailable,
    };
    return cached;
}
