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

/**
 * Each post's place in publication order, oldest first, keyed by id.
 *
 * A property of the archive rather than of whatever list is being rendered.
 * Deriving it from a list's own index works on the home page by accident and
 * breaks on a tag page, where a filtered list of one would number the newest
 * post `01`. Publishing does not renumber what came before.
 */
export async function getArchiveNumbers(): Promise<Map<string, number>> {
    const posts = await getPosts(); // newest first
    return new Map(posts.map((post, i) => [post.id, posts.length - i]));
}

/**
 * The post to read after this one: the next newer, or the next older when this
 * is already the newest. Null only when it is the only post.
 *
 * The end of an article is the highest-intent moment a reading site gets, and
 * it used to be a dead end — tags, then five rems of nothing, then the footer.
 */
export async function getNextToRead(id: string): Promise<Post | null> {
    const posts = await getPosts(); // newest first
    const i = posts.findIndex((p) => p.id === id);
    if (i === -1 || posts.length < 2) return null;
    return i === 0 ? posts[1] : posts[i - 1];
}

/** Every tag in use, deduplicated and alphabetised. */
export async function getTags(): Promise<string[]> {
    const posts = await getPosts();
    return [...new Set(posts.flatMap((p) => p.data.tags))].sort((a, b) => a.localeCompare(b));
}
