/**
 * The page and blog post schemas (front matter), shared by every site. A site builds its own section types (its design)
 * from the helpers here and passes them in:
 *
 *   export const pageSchema = createPageSchema({ siteName: site.site_name, contentBlock: z.discriminatedUnion('_type', [...]) });
 *   export const postSchema = createPostSchema({ siteName: site.site_name });
 *
 * content.config.ts uses them for the site's collections, and the build exports them as JSON Schema to
 * admin/content-rules.json, so the CMS's AI connector checks new and changed pages against exactly what the site accepts.
 */
import { z } from 'astro/zod';
export const image = z.object({
    src: z.string(),
    alt: z.string().default(''),
    width: z.number().optional(),
    height: z.number().optional(),
});
export const button = z.object({
    label: z.string(),
    // A URL, or "#book-now" to open the Book Now popup.
    link: z.string(),
});
// "Blog posts list": the /blog/ list of posts, on the Blog page (Pages → Blog). Its header, paging, and the card shown
// in every post's sidebar.
export const blogListBlock = z.object({
    _type: z.literal('blog_list'),
    hidden: z.boolean().default(false),
    eyebrow: z.string().default(''),
    heading: z.string(),
    intro: z.string().optional(),
    header_image: image.optional(),
    posts_per_page: z.number().int().min(1).max(50).default(10),
    sidebar: z.object({
        heading: z.string(),
        text: z.string().default(''),
        button_label: z.string(),
        // A page URL, a full URL, or "#book-now" to open the Book Now popup.
        button_link: z.string(),
    }),
});
/** A group of optional fields: the CMS leaves the whole group out when all of its fields are empty. */
export const group = (shape) => z.preprocess((value) => value ?? {}, z.object(shape));
/**
 * Only a page's or post's title is required. Empty SEO fields fall back the way Rank Math's defaults do: the SEO title
 * is "<title> - <site name>"; an empty meta description is left out (posts use their excerpt, see lib/blog).
 */
export const seoGroup = group({
    title: z.string().nullish().transform((v) => v?.trim() ?? ''),
    description: z.string().nullish().transform((v) => v?.trim() ?? ''),
    // The main search phrase the page should rank for. Not output on the page; the SEO report checks it.
    focus_keyword: z.string().nullish().transform((v) => v ?? undefined),
});
export const seoTitle = (siteName) => (seo, title) => seo.title || [title.trim(), siteName].filter(Boolean).join(' - ');
/**
 * Pages: the CMS shows the page's SEO in three blocks, stored as three groups:
 * - `seo`: what search results show (title, description);
 * - `social`: social share title, type and image (Open Graph, also used in the schema.org data);
 * - `advanced`: canonical URL, search engine visibility, robots, dates.
 * They're merged back into one `seo` object here, which the SEO components (SEO.astro, SchemaOrg.astro) read.
 * `contentBlock` is the site's own section types (a discriminated union on `_type`).
 */
export function createPageSchema({ siteName, contentBlock }) {
    const title = seoTitle(siteName);
    return z
        .object({
        title: z.string(),
        // Draft: built at its address (so the CMS preview works) but hidden from search engines, menus and the sitemap.
        draft: z.boolean().default(false),
        seo: seoGroup,
        social: group({
            og_title: z.string().optional(),
            og_type: z.string().default('website'),
            og_image: image.optional(),
        }),
        advanced: group({
            canonical: z.string().optional(),
            // "Hide this page from search engines": outputs noindex, follow (as Yoast does) instead of `robots`.
            hide_from_search: z.boolean().default(false),
            robots: z.string().default('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'),
            date_published: z.string().optional(),
            date_modified: z.string().optional(),
        }),
        content_blocks: z.preprocess((value) => value ?? [], z.array(contentBlock)),
    })
        .transform(({ seo, social, advanced, ...page }) => ({ ...page, seo: { ...seo, title: title(seo, page.title), ...social, ...advanced } }));
}
/**
 * Blog posts (CMS → Blog). Each one is served at the site root, /<slug>/, like WordPress posts, so old links and
 * rankings carry over (or under the site's blog_path, cms/features.yml); the archive is /blog/. `slug` in the front
 * matter overrides the file name. `extend` adds the site's own post fields (their CMS fields: cms/post-fields.yml).
 */
const postFields = {
    title: z.string(),
    // The address: lower case words and dashes only (some WordPress addresses use a non-breaking hyphen, U+2011).
    // No "/" or "..", so a post can't be built over another page or outside its folder.
    slug: z
        .string()
        .regex(/^[a-z0-9]+(?:[-‑][a-z0-9]+)*$/, 'A post address may only use lower case letters, digits and dashes.')
        .optional(),
    // The CMS fills in today when a post is made; a file without a date counts as published at build time.
    date: z.preprocess((value) => (value === undefined || value === null || value === '' ? new Date() : value), z.coerce.date()),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    image: image.optional(),
    excerpt: z.string().nullish().transform((v) => v ?? ''),
    seo: seoGroup,
    advanced: group({
        hide_from_search: z.boolean().default(false),
        robots: z.string().default('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'),
    }),
};
export function createPostSchema({ siteName, extend }) {
    const title = seoTitle(siteName);
    return z
        .object(postFields)
        // The site's own post fields (e.g. author, medical reviewer); a site may also tighten a shared one (e.g. image).
        .extend((extend ?? {}))
        .transform((data) => {
        const { seo, advanced, ...post } = data;
        return {
            ...post,
            // The same shape pages pass to the SEO components.
            seo: {
                ...seo,
                title: title(seo, post.title),
                ...advanced,
                og_type: 'article',
                og_title: post.title,
                og_image: post.image,
                date_published: post.date.toISOString(),
                date_modified: (post.updated ?? post.date).toISOString(),
                canonical: undefined,
            },
        };
    });
}
