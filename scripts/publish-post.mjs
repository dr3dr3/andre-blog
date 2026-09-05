#!/usr/bin/env node
/**
 * Take one post from draft to published.
 *
 *   node scripts/publish-post.mjs <slug> --check     report readiness, change nothing
 *   node scripts/publish-post.mjs <slug>             set the date, drop the marker, publish
 *
 * The gates below are WRITING.md §12, minus the items only a human can judge.
 * Nothing is committed, pushed or deployed here — a merge to main does that,
 * and that stays a person's decision.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const POSTS = 'src/content/posts';
const BANNED_WORDS =
    'leverage journey transformative game-changing seamless robust delve unlock supercharge elevate harness landscape realm tapestry testament crucial pivotal myriad plethora'.split(
        ' ',
    );
const SELF_GRADING = 'successfully impressive dramatically significant'.split(' ');
const BANNED_CONSTRUCTIONS = [
    "In today's",
    "It's not just",
    "Let's dive",
    'The reality is',
    'You might be wondering',
];

const args = process.argv.slice(2);
const check = args.includes('--check');
const slug = args.find((a) => !a.startsWith('--'));

if (!slug) {
    const drafts = existsSync(POSTS)
        ? readdirSync(POSTS).filter((f) => readFileSync(join(POSTS, f), 'utf8').includes('draft: true'))
        : [];
    console.error('usage: publish-post <slug> [--check]');
    if (drafts.length) console.error('\ndrafts:\n  ' + drafts.map((f) => f.replace(/\.mdx?$/, '')).join('\n  '));
    process.exit(2);
}

const path = join(POSTS, `${slug}.mdx`);
if (!existsSync(path)) {
    console.error(`no such post: ${path}`);
    process.exit(2);
}

let src = readFileSync(path, 'utf8');
const fm = src.split('---\n')[1] ?? '';
const bodyRaw = src.split('---\n').slice(2).join('---\n');
const prose = bodyRaw
    .replace(/<Artefact[\s\S]*?<\/Artefact>/g, '')
    .replace(/`\[\[TK:[\s\S]*?\]\]`/g, '')
    .replace(/^import .*$/gm, '');

const field = (k) => (fm.match(new RegExp(`^${k}: '(.+)'$`, 'm')) ?? [])[1];
const failures = [];
const gate = (ok, label, evidence) => {
    console.log(`${ok ? '  ok   ' : '  FAIL '}${label}${ok || !evidence ? '' : '  ' + evidence}`);
    if (!ok) failures.push(label);
};

console.log(`\npre-publish gates — ${slug}\n`);

// The one marker allowed through is the published-date placeholder this script replaces.
// Artefact blocks are excluded: their contents are quoted evidence, and a post may
// legitimately reproduce a document that is itself made of [[TK: markers. A marker
// standing in for an artefact that was never supplied sits in prose, not inside a
// rendered <Artefact>, so it is still caught.
const outsideArtefacts = src.replace(/<Artefact[\s\S]*?<\/Artefact>/g, '');
const markers = [...outsideArtefacts.matchAll(/\[\[TK:([\s\S]{0,60})/g)].map((m) => m[1].trim());
const stray = markers.filter((m) => !/PUBLISHED DATE IS A PLACEHOLDER/.test(m));
gate(stray.length === 0, '[[TK: markers answered', stray.map((m) => `"${m}…"`).join(', '));

gate(/^draft: true$/m.test(fm), 'draft: true (not already published)');

const hits = BANNED_WORDS.filter((w) => new RegExp(`\\b${w}`, 'i').test(src));
gate(hits.length === 0, 'kill-list words', hits.join(', '));
const cons = BANNED_CONSTRUCTIONS.filter((c) => src.toLowerCase().includes(c.toLowerCase()));
gate(cons.length === 0, 'kill-list constructions', cons.join(', '));
gate(!src.includes('!'), 'no exclamation marks');

const grading = SELF_GRADING.filter((w) => new RegExp(`\\b${w}`, 'i').test(prose));
gate(grading.length === 0, 'no self-grading adjectives', grading.join(', '));

const ize = src.match(/\w+iz(?:e|ed|ing|ation)\b/g) ?? [];
gate(ize.length === 0, 'Australian English (-ise)', ize.join(', '));

const artefactTags = src.match(/<Artefact\b[^>]*>/g) ?? [];
const captioned = artefactTags.filter((tag) => /\bcaption=/.test(tag)).length;
gate(artefactTags.length === captioned, 'every artefact captioned', `${captioned}/${artefactTags.length}`);

const title = field('title') ?? '';
const summary = field('summary') ?? '';
gate(title.length > 0 && title.length <= 70, 'title under 70 chars', `${title.length}`);
gate(summary.length > 0 && summary.length <= 180, 'summary under 180 chars', `${summary.length}`);
for (const k of ['archetype', 'context']) gate(new RegExp(`^${k}:`, 'm').test(fm), `frontmatter ${k}`);
gate(/^\s+status: '(shipped|abandoned|still-running|experiment)'$/m.test(fm), 'outcome.status set');
gate(/^\s+- name:/m.test(fm), 'stack populated');
gate(!/^\s+was:/m.test(fm) || /^\s+changed:/m.test(fm), 'outcome.was implies outcome.changed');

// Scrubbing is the one that would be expensive to get wrong in public.
const leaks = prose.match(/\bENG-\d+\b/g) ?? [];
gate(leaks.length === 0, 'no ticket ids in prose', leaks.join(', '));

console.log('');
if (failures.length) {
    console.error(`NOT READY — ${failures.length} gate(s) failed\n`);
    process.exit(1);
}
if (check) {
    console.log('READY — run without --check to publish\n');
    process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
src = src.replace(/^published: .+$/m, `published: ${today}`);
src = src.replace(/`\[\[TK: PUBLISHED DATE IS A PLACEHOLDER[\s\S]*?\]\]`\n\n/, '');
src = src.replace(/^draft: true$/m, 'draft: false');
writeFileSync(path, src);

// Same exclusion as the gate above: markers quoted inside an artefact are evidence,
// not unanswered questions, and must not fail the write-back check.
const after = readFileSync(path, 'utf8');
const afterOutsideArtefacts = after.replace(/<Artefact[\s\S]*?<\/Artefact>/g, '');
if (afterOutsideArtefacts.includes('[[TK:') || !/^draft: false$/m.test(after)) {
    console.error('post-write verification failed — inspect the file before committing');
    process.exit(1);
}

console.log(`published: ${today}`);
console.log(`draft: false\n`);
console.log('next, and both are yours:');
console.log('  1. pnpm build   # confirm /posts/' + slug + '/ appears in dist without INCLUDE_DRAFTS');
console.log('  2. commit, push, and merge to main — the merge is what deploys\n');
