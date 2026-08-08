/**
 * Frontmatter dates arrive as YAML dates, which parse to UTC midnight. Every
 * formatter here pins the timezone to UTC so the rendered date matches what was
 * typed in the file rather than the timezone of whatever machine ran the build.
 */

const LONG = new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
});

/** `2026-09-14` — for `<time datetime>` and the metadata block. */
export function isoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/** `14 September 2026` — for prose. */
export function longDate(date: Date): string {
    return LONG.format(date);
}

/**
 * Whole minutes at 200 words per minute, floored at 1.
 *
 * Counts the raw MDX body, so import statements and JSX tags inflate it
 * slightly. Close enough for a hint, and honest about being an estimate.
 */
export function readingMinutes(body: string): number {
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}
