import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * The only way any page is allowed to read the posts collection.
 *
 * Drafts are visible while running `astro dev` and never appear in a build, so
 * a post with `draft: true` cannot leak into production through a page that
 * forgot to filter. Sorted newest first.
 *
 * `INCLUDE_DRAFTS=1` puts drafts into a build too. It exists because `astro dev`
 * cannot start when the working tree is on a Windows bind mount — Vite's module
 * runner times out crossing 9p — which leaves no other way to read a draft
 * rendered. Set it locally, never in Vercel. See "Local development" in the
 * README.
 */
const includeDrafts = import.meta.env.DEV || process.env.INCLUDE_DRAFTS === '1';

export async function getPosts(): Promise<Post[]> {
    const posts = await getCollection('posts', ({ data }) => includeDrafts || !data.draft);
    return posts.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}

/** Every tag in use, deduplicated and alphabetised. */
export async function getTags(): Promise<string[]> {
    const posts = await getPosts();
    return [...new Set(posts.flatMap((p) => p.data.tags))].sort((a, b) => a.localeCompare(b));
}
