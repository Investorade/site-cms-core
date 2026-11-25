import type { AstroIntegration } from 'astro';
/**
 * The site's CMS config (/admin/config.yml), put together from the core's cms/*.yml and the site's cms/*.yml:
 *
 *   core base.yml + site site.yml (the site's keys override the core's; backend is merged key by key)
 *   collections:
 *     core pages.yml, with the site's sections.yml as the section types of "Page sections" (content_blocks)
 *     core posts.yml
 *     the site's own collections (site.yml → collections), if any
 *     a divider
 *     core settings.yml, with the site's settings.yml files after the core's
 *
 * In any of these files, `!core <name>` is a shared field set from the core's fields.yml (`fields: !core image`).
 * The dev server serves the result at /admin/config.yml, and the build writes it to dist/admin/config.yml.
 */
type Obj = Record<string, unknown>;
/** The site's CMS config as data. `root` is the site's folder. */
export declare function readCmsConfig(root: string): Obj;
export type SiteType = 'park' | 'business' | 'medical';
export interface SiteProfile {
    site_type: SiteType;
    features: {
        pages: boolean;
        blog: boolean;
        popups: boolean;
        ai_connector: boolean;
    };
    /** Where posts live: "/" (at the site root, /<post>/) or e.g. "/blog/" (/blog/<post>/). */
    blog_path: string;
    wording: Record<string, string>;
}
/**
 * The site's cms/features.yml: its type and which shared parts it uses. Without the file a site is a "business" site
 * with the blog and the AI connector and without pop-ups. (Sites made before 1.3.0 get the file from the 1.3.0
 * update, as "park" sites.)
 *
 *   site_type: park            # park | business | medical: the examples in the CMS's hints
 *   features:
 *     pages: true              # Pages made of sections (off: the site has its own page collections, cms/collections.yml)
 *     blog: true               # the Blog collection
 *     popups: true             # Book Now / exit pop-ups: #book-now in link hints
 *     ai_connector: true       # Site settings → AI connector (it needs pages made of sections)
 *   blog_path: /               # where posts live: / (/<post>/, the default) or e.g. /blog/ (/blog/<post>/)
 *   wording:                   # optional: replace any hint example from the core's cms/wording.yml
 *     image_alt_example: "…"
 */
export declare function readSiteProfile(root: string): SiteProfile;
/** The site's /admin/config.yml as text. */
export declare function cmsConfigYaml(root: string): string;
/** Serves /admin/config.yml in dev, checks it before the build and writes it to dist/admin/config.yml after. */
export default function cmsConfig(): AstroIntegration;
export {};
