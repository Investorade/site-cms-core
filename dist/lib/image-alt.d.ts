/**
 * Image descriptions (written on the CMS's Images page, saved to src/data/image-alt.json): alt text written once per image
 * and used wherever that image appears without its own.
 *
 * Applied to the built HTML (src/integrations/seo-files.ts), so it works for any section of any park, including images
 * whose section has no Alt text field (logos, popup images):
 * - an image with its own alt text keeps it;
 * - otherwise it gets the description from the list;
 * - an image marked Decorative gets alt="" and role="presentation" (screen readers skip it, and the SEO checks don't
 *   count it as missing).
 *
 * Every image found is also listed (with the pages it's on and where its alt text comes from) for the CMS Images page.
 */
export interface ImageDescription {
    src?: string;
    alt?: string;
    decorative?: boolean;
}
export type AltSource = 'field' | 'list' | 'decorative' | 'missing';
export interface ImageUse {
    /** The image's path on the site, e.g. /uploads/2023/07/photo.jpg (or a full URL for another site's image). */
    src: string;
    /** The alt text visitors get, after the list is applied ("" when decorative or missing). */
    alt: string;
    /** Where the alt text comes from. With different answers on different pages, the worst one ("missing" first). */
    source: AltSource;
    /** Pages the image is on, e.g. ["/", "/pricing/"]. */
    pages: string[];
    width?: number;
    height?: number;
}
/** The image's path on this site (no query or #hash, decoded), or the full URL for another site's image. */
export declare function imageKey(src: string, origin: string): string;
export declare class ImageAlt {
    private readonly origin;
    private readonly byKey;
    private readonly uses;
    /** List entries that didn't apply to any image in the build (e.g. the image was removed from the site). */
    readonly problems: string[];
    constructor(origin: string, list: ImageDescription[]);
    /** Applies the list to one built page and records its images. Returns the new HTML. */
    apply(html: string, pagePath: string): string;
    private record;
    /** Every image in the build, those still missing a description first. */
    images(): ImageUse[];
    /** List entries whose image isn't on any built page. */
    unused(): string[];
}
