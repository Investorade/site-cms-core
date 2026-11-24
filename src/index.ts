import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import contentRules, { type ContentRulesOptions } from './integrations/content-rules.ts';
import formsCheck from './integrations/forms-check.ts';
import seoFiles from './integrations/seo-files.ts';

/**
 * The CMS core, as one entry in a site's astro.config.mjs:
 *
 *   import siteCmsCore from '@investorade/site-cms-core';
 *   import { pageSchema, postSchema } from './src/lib/content-schemas.ts';
 *   integrations: [siteCmsCore({ schemas: { pages: pageSchema, posts: postSchema } })]
 *
 * - seo-files: _redirects (CMS redirects + trailing-slash 301s), sitemap.xml, image descriptions, SEO report.
 * - forms-check: validates each form's lead emails & webhooks and makes sure none of them reach the website.
 * - content-rules: one address per page and post (before the build), and admin/content-rules.json (what pages and posts
 *   may contain, for the CMS's AI connector).
 *
 * The core's components and helpers read the site's settings files through the `@site/` alias (the site's src/ folder,
 * e.g. @site/data/site.json).
 */
export type SiteCmsCoreOptions = ContentRulesOptions;

function setup(): AstroIntegration {
	return {
		name: 'site-cms-core',
		hooks: {
			'astro:config:setup': ({ config, updateConfig }) => {
				updateConfig({
					vite: {
						// The core's components and helpers use astro:content and @site/, so the build must process them (in every
						// build environment: server, prerender).
						resolve: { alias: [{ find: /^@site\//, replacement: fileURLToPath(new URL('./src/', config.root)) }], noExternal: ['@investorade/site-cms-core'] },
						ssr: { noExternal: ['@investorade/site-cms-core'] },
					},
				});
			},
		},
	};
}

export default function siteCmsCore(options: SiteCmsCoreOptions): AstroIntegration[] {
	return [setup(), seoFiles(), formsCheck(), contentRules(options)];
}
