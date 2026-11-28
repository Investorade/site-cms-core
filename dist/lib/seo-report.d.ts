/**
 * What the build tells the CMS about each built page, written to dist/admin/seo-report.json. The CMS's SEO page and
 * the editor's SEO panel (shared from cms.dadscampgrounds.com/kit/) read it:
 * - `seo`: the page as an SEO checker sees it (title, description, address, focus keywords and the HTML of the page's
 *   own content). The kit scores it the way Rank Math does (kit/seo-rules.js), so every park gets the same rules.
 * - `technical`: checks only the build can make (one H1, canonical, visible to search, share image, image alt text,
 *   broken links).
 *
 * The page's own content is what Rank Math would analyse on WordPress: the post or page content, not the header, footer
 * or site-wide parts. Elements marked `data-seo-content` are that content (a blog post's text); otherwise it's <main>
 * without the elements marked `data-seo-skip` (the "Plan your stay" banner). `data-seo-toc` marks a table of contents
 * and `data-seo-thumbnail` a post's featured image.
 */
export type CheckStatus = 'pass' | 'warn' | 'fail';
export interface Check {
    id: string;
    label: string;
    status: CheckStatus;
    /** What was found, e.g. "2 H1 headings". */
    detail: string;
    /** How to fix it, shown when the check isn't passed. */
    fix?: string;
    /** Addresses or items the check is about, e.g. the broken links. */
    items?: string[];
}
/** The page as the kit's SEO rules take it (kit/seo-rules.js). */
export interface SeoInput {
    kind: 'home' | 'page' | 'post' | 'blog';
    /** The page's full address on the live domain (its canonical URL). */
    url: string;
    title: string;
    description: string;
    /** Focus keywords, main one first. */
    keywords: string[];
    /** HTML of the page's own content. */
    content: string;
    thumbnail?: {
        src: string;
        alt: string;
    };
    hasToc: boolean;
    excerpt?: string;
}
export interface PageReport {
    /** URL path with trailing slash, e.g. `/` or `/pricing/`. */
    path: string;
    url: string;
    /** The CMS collection and entry this page is edited in, if any. */
    collection?: 'pages' | 'posts' | 'designs';
    entry?: string;
    title: string;
    description: string;
    thumbnail?: string;
    indexable: boolean;
    draft?: boolean;
    modified?: string;
    seo: SeoInput;
    technical: Check[];
}
/** What the page's CMS file says (src/content/pages or src/content/posts). */
export interface EntryInfo {
    collection: 'pages' | 'posts' | 'designs';
    entry: string;
    keywords: string[];
    excerpt?: string;
    draft?: boolean;
}
export interface PageContext {
    origin: string;
    /** Whether an internal address leads somewhere: a page, a file, or a redirect. */
    resolves: (path: string) => boolean;
    entryFor: (path: string) => EntryInfo | undefined;
}
export declare function decodeEntities(text: string): string;
export declare const attr: (tag: string, name: string) => string | undefined;
/**
 * The HTML of the page's own content, shaped like WordPress post content: no scripts, styles, icons or dialogs, a line
 * break between blocks (as the WordPress editor saves them) and plain characters instead of entities.
 */
export declare function ownContent(html: string): string;
export declare function analyzePage(html: string, pagePath: string, ctx: PageContext): PageReport;
