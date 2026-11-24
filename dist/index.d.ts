import type { AstroIntegration } from 'astro';
import { type ContentRulesOptions } from './integrations/content-rules.ts';
/**
 * The CMS core, as one entry in a site's astro.config.mjs:
 *
 *   import siteCmsCore from '@investorade/site-cms-core';
 *   import { pageSchema, postSchema } from './src/lib/content-schemas.ts';
 *   integrations: [siteCmsCore({ schemas: { pages: pageSchema, posts: postSchema } })]
 *
 * - seo-files: _redirects (CMS redirects + trailing-slash 301s), sitemap.xml, image descriptions, SEO report.
 * - forms-check: validates each form's lead emails & webhooks and makes sure none of them reach the website.
 * - cms-config: /admin/config.yml, the CMS config, from the core's cms/*.yml and the site's cms/*.yml (served by the dev
 *   server, written by the build).
 * - content-rules: one address per page and post (before the build), and admin/content-rules.json (what pages and posts
 *   may contain, for the CMS's AI connector).
 *
 * The core's components and helpers read the site's settings files through the `@site/` alias (the site's src/ folder,
 * e.g. @site/data/site.json).
 */
export type SiteCmsCoreOptions = ContentRulesOptions;
export { readCmsConfig, cmsConfigYaml, coreSectionTypes } from './cms-config.ts';
export default function siteCmsCore(options: SiteCmsCoreOptions): AstroIntegration[];
