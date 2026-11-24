/**
 * Attributes for a CMS-entered link.
 * - "#book-now" (any popup id) opens that popup.
 * - Off-site http(s) links open in a new tab, as on the WordPress site.
 */
export declare function linkAttrs(link: string): Record<string, string>;
/** Absolute URL on the production domain, for SEO tags and structured data. */
export declare function absoluteUrl(path: string): string;
