import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts } from '../../lib/posts';
import { renderCard, type Card } from '../../lib/og';
import { isoDate } from '../../lib/format';

/**
 * One card per post, plus the home page's. Static output, so these are rendered
 * once at build and served as files; nothing runs per request.
 *
 * The home entry is a reserved slug rather than a second endpoint, so both
 * cards go through the same renderer and cannot drift apart.
 */
export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getPosts();
    return [
        {
            params: { slug: 'home' },
            props: {
                card: {
                    kind: 'home',
                    name: 'André Dreyer',
                    line: 'Notes on platform engineering, AI agents and the systems around them.',
                } satisfies Card,
            },
        },
        ...posts.map((post) => ({
            params: { slug: post.id },
            props: {
                card: {
                    kind: 'post',
                    title: post.data.title,
                    // The same form the index kicker uses, so the card and the page agree.
                    date: isoDate(post.data.published),
                    status: post.data.outcome.status,
                    archetype: post.data.archetype,
                } satisfies Card,
            },
        })),
    ];
};

export const GET: APIRoute = async ({ props }) => {
    const png = await renderCard(props.card as Card);
    return new Response(new Uint8Array(png), {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
};
