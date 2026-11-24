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
/** The site's /admin/config.yml as text. */
export declare function cmsConfigYaml(root: string): string;
/** Serves /admin/config.yml in dev, checks it before the build and writes it to dist/admin/config.yml after. */
export default function cmsConfig(): AstroIntegration;
export {};
