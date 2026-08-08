import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts';

/**
 * Hand-rolled rather than pulling in @astrojs/rss — the feed is thirty lines and
 * carries summaries only, so the dependency would buy nothing.
 */

const escape = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
    if (!site) throw new Error('`site` must be set in astro.config.mjs for the RSS feed to build.');
    const posts = await getPosts();

    const items = posts
        .map((post) => {
            const url = new URL(`/posts/${post.id}/`, site).href;
            return [
                '        <item>',
                `            <title>${escape(post.data.title)}</title>`,
                `            <link>${escape(url)}</link>`,
                `            <guid isPermaLink="true">${escape(url)}</guid>`,
                `            <description>${escape(post.data.summary)}</description>`,
                `            <pubDate>${post.data.published.toUTCString()}</pubDate>`,
                '        </item>',
            ].join('\n');
        })
        .join('\n');

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '    <channel>',
        '        <title>André Dreyer</title>',
        `        <link>${escape(site.href)}</link>`,
        `        <atom:link href="${escape(new URL('/rss.xml', site).href)}" rel="self" type="application/rss+xml" />`,
        '        <description>Notes on platform engineering, AI agents and the systems around them.</description>',
        '        <language>en-AU</language>',
        items,
        '    </channel>',
        '</rss>',
        '',
    ].join('\n');

    return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
