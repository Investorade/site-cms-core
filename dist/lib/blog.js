import { getCollection, getEntry } from 'astro:content';
import profile from 'virtual:site-cms-core/profile';
const DEFAULT_LIST = {
    _type: 'blog_list',
    hidden: false,
    eyebrow: '',
    heading: 'Blog',
    posts_per_page: 10,
    // No sidebar card unless the Blog page sets one (Pages → Blog → Blog posts list).
    sidebar: { heading: '', text: '', button_label: '', button_link: '' },
};
/** The Blog page's "Blog posts list" section (Pages → Blog): header, paging and the post sidebar card. */
export async function blogList() {
    // Sites without pages made of sections have no Blog page: the defaults then.
    const page = profile.features.pages ? await getEntry('pages', 'blog') : undefined;
    // The visible one, else a hidden one (its texts still apply), else defaults.
    const lists = (page?.data.content_blocks ?? []).filter((b) => b._type === 'blog_list');
    const block = lists.find((b) => !b.hidden) ?? lists[0];
    return block ? { ...block, hidden: false } : DEFAULT_LIST;
}
/** Published posts, newest first: the ones listed on the blog, in the sidebar and in the sitemap. */
export async function getPosts() {
    return (await getAllPosts()).filter((post) => !post.data.draft);
}
/**
 * Every post, drafts included, newest first. Drafts are built at their address too, so the CMS preview works, but
 * they're hidden from search engines (noindex) and left out of the blog list, the sidebar and the sitemap.
 */
export async function getAllPosts() {
    const posts = await getCollection('posts');
    // An empty meta description uses the excerpt (or the start of the post), as Rank Math does.
    for (const post of posts) {
        // One kind of line ending, whatever the file was saved with (a post saved on Windows has \r\n), so the FAQ data
        // and other text checks read every post the same way.
        if (post.body)
            post.body = post.body.replace(/\r\n?/g, '\n');
        if (!post.data.seo.description)
            post.data.seo.description = excerptOf(post, 160);
    }
    return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
/** A post's address: /<slug>/ at the site root, as on WordPress, or under the site's blog path (cms/features.yml). */
export const postUrl = (post) => `${profile.blog_path}${post.id}/`;
/** "October 20, 2025" (US English, as on the WordPress site), using the date as written, not the build's time zone. */
export const formatDate = (date) => date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
/** Minutes to read at about 220 words a minute, never less than 1. */
export function readingMinutes(markdown) {
    const words = (markdown ?? '')
        .replace(/[#*_>`[\]()-]/g, ' ')
        .split(/\s+/)
        .filter(Boolean).length;
    return Math.max(1, Math.round(words / 220));
}
/** The excerpt from the CMS, or the start of the post when it's empty. */
export function excerptOf(post, length = 180) {
    if (post.data.excerpt)
        return post.data.excerpt;
    const text = (post.body ?? '')
        .replace(/^#+ .*$/gm, '')
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[*_>`#-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    return text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, '')}…` : text;
}
