import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * The only way any page is allowed to read the posts collection.
 *
 * Drafts are visible while running `astro dev` and never appear in a build, so
 * a post with `draft: true` cannot leak into production through a page that
 * forgot to filter. Sorted newest first.
 */
export async function getPosts(): Promise<Post[]> {
    const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
    return posts.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}

/** Every tag in use, deduplicated and alphabetised. */
export async function getTags(): Promise<string[]> {
    const posts = await getPosts();
    return [...new Set(posts.flatMap((p) => p.data.tags))].sort((a, b) => a.localeCompare(b));
}
