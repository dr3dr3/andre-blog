/**
 * Runs Lighthouse and enforces the budget in docs/PERFORMANCE.md.
 *
 * Until 2026-09-08 this could not run from a session at all: the dev container
 * had no browser, so every check was handed to André and pasted back as a
 * screenshot. A design pass that measured nothing for two days is what that
 * cost. The container now carries a pinned Chromium, and this is the runner.
 *
 *     pnpm lighthouse                          # production, mobile
 *     pnpm lighthouse --desktop                # production, desktop
 *     pnpm lighthouse http://localhost:4380/   # a local `pnpm preview`
 *
 * Production is the default on purpose. PERFORMANCE.md says to measure the
 * deployed site, because throttling, compression and caching all differ from a
 * local preview, and the number that matters is the one a reader gets. A local
 * run is a pre-flight, not the verdict.
 */
import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

/**
 * Resolve a browser without pinning a Playwright revision into the path — that
 * number changes on every browser update and would silently break this script.
 */
function findChrome() {
    if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
    const pw = join(homedir(), '.cache', 'ms-playwright');
    if (existsSync(pw)) {
        const dirs = readdirSync(pw)
            .filter((d) => d.startsWith('chromium-'))
            .sort()
            .reverse();
        for (const d of dirs) {
            const bin = join(pw, d, 'chrome-linux', 'chrome');
            if (existsSync(bin)) return bin;
        }
    }
    for (const bin of ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']) {
        if (existsSync(bin)) return bin;
    }
    console.error(
        'No browser found. Install one with:\n' +
            '  pnpm dlx playwright install --with-deps chromium\n' +
            'or point CHROME_PATH at an existing Chromium-based binary.',
    );
    process.exit(1);
}

const CHROME = findChrome();
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const METRICS = [
    'first-contentful-paint',
    'largest-contentful-paint',
    'total-blocking-time',
    'cumulative-layout-shift',
    'speed-index',
];

const args = process.argv.slice(2);
const desktop = args.includes('--desktop');
const url = args.find((a) => a.startsWith('http')) ?? 'https://andredreyer.com/';

const chrome = await launch({
    chromePath: CHROME,
    // No sandbox: this runs unprivileged inside a container, which is the only
    // place it runs. Never point this at an untrusted page.
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});

/*
 * Kill the browser exactly once, from wherever the script leaves.
 *
 * This used to be a `finally` with `process.exit()` inside the `try` above it,
 * which is the bug that leaked 90 orphaned Chromium roots — 360 processes and
 * 22.8GB of resident memory — into this devcontainer over a day.
 * `process.exit()` terminates the process synchronously and a pending `finally`
 * never runs, so `chrome.kill()` was skipped on *every* invocation, not only
 * the failing ones. The browsers were reparented to init and sat there.
 *
 * A signal handler covers the other half: Ctrl-C on a slow run left a browser
 * behind for the same reason.
 */
let killed = false;
const kill = () => {
    if (killed) return;
    killed = true;
    try {
        chrome.kill();
    } catch {
        // Already gone. Nothing to do, and never worth failing a run over.
    }
};
process.on('exit', kill);
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => {
        kill();
        process.exit(130);
    });
}

try {
    const result = await lighthouse(
        url,
        { port: chrome.port, output: ['json', 'html'], logLevel: 'error' },
        desktop ? (await import('lighthouse/core/config/desktop-config.js')).default : undefined,
    );
    const lhr = result.lhr;

    mkdirSync('.lighthouse', { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const base = `.lighthouse/${stamp}__${desktop ? 'desktop' : 'mobile'}`;
    writeFileSync(`${base}.json`, result.report[0]);
    writeFileSync(`${base}.html`, result.report[1]);

    console.log(`\n${lhr.finalDisplayedUrl}`);
    console.log(`${desktop ? 'Desktop' : 'Mobile'} · Lighthouse ${lhr.lighthouseVersion} · ${lhr.fetchTime}\n`);

    let failed = 0;
    for (const id of CATEGORIES) {
        const cat = lhr.categories[id];
        if (!cat) continue;
        const score = Math.round(cat.score * 100);
        if (score < 100) failed++;
        console.log(`  ${score === 100 ? '✔' : '✗'} ${cat.title.padEnd(16)} ${String(score).padStart(3)}`);
    }

    console.log('');
    for (const id of METRICS) {
        const a = lhr.audits[id];
        if (a) console.log(`    ${a.title.padEnd(26)} ${a.displayValue ?? '—'}`);
    }

    // Everything that scored below 1, so a drop names itself rather than
    // needing the HTML report opened to find out why.
    const opportunities = Object.values(lhr.audits)
        .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative')
        .sort((a, b) => a.score - b.score);
    if (opportunities.length) {
        console.log('\n  Audits below 1:');
        for (const a of opportunities) {
            console.log(`    ${a.score.toFixed(2)}  ${a.id} — ${a.title}`);
        }
    }

    console.log(`\n  Report: ${base}.html`);
    console.log(
        failed === 0
            ? '\n100 across the board. Budget held.\n'
            : `\n${failed} categor${failed === 1 ? 'y is' : 'ies are'} below 100. See docs/PERFORMANCE.md.\n`,
    );
    // `kill` also runs on 'exit', so the browser is gone either way. Setting
    // the code rather than calling process.exit() keeps the handler's contract
    // simple: one exit path, one kill.
    process.exitCode = failed === 0 ? 0 : 1;
} finally {
    kill();
}
