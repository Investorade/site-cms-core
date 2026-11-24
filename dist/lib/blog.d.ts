import { type CollectionEntry } from 'astro:content';
import type { BlogListBlock } from '../schemas.ts';
export type Post = CollectionEntry<'posts'>;
/** The Blog page's "Blog posts list" section (Pages → Blog): header, paging and the post sidebar card. */
export declare function blogList(): Promise<BlogListBlock>;
/** Published posts, newest first: the ones listed on the blog, in the sidebar and in the sitemap. */
export declare function getPosts(): Promise<Post[]>;
/**
 * Every post, drafts included, newest first. Drafts are built at their address too, so the CMS preview works, but
 * they're hidden from search engines (noindex) and left out of the blog list, the sidebar and the sitemap.
 */
export declare function getAllPosts(): Promise<Post[]>;
/** A post's address: /<slug>/ at the site root, as on WordPress. */
export declare const postUrl: (post: Post) => string;
/** "October 20, 2025" (US English, as on the WordPress site), using the date as written, not the build's time zone. */
export declare const formatDate: (date: Date) => string;
/** Minutes to read at about 220 words a minute, never less than 1. */
export declare function readingMinutes(markdown: string | undefined): number;
/** The excerpt from the CMS, or the start of the post when it's empty. */
export declare function excerptOf(post: Post, length?: number): string;
