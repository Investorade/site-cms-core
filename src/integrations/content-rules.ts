import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { z } from 'astro/zod';
import YAML from 'yaml';
import { readCmsConfig, readSiteProfile } from '../cms-config.ts';

/**
 * Writes dist/admin/content-rules.json: what a page and a blog post may contain, for the CMS's AI connector
 * (dadscampgrounds-cms-auth, /admin/mcp on the park's address). It checks every page or post an AI writes against
 * these rules before saving, so nothing the site's build would reject (or a section that doesn't exist) is committed.
 *
 * - `schema`: the front matter as JSON Schema, made from the same Zod schemas the site builds with
 *   (src/lib/content-schemas.ts).
 * - `cms`: the CMS fields from the CMS config (cms/*.yml) (labels, hints, select options), so the AI knows what each
 *   section and field is for, and select fields (icons, looks) only take the CMS's choices.
 * - Where things live: content folders, the media folder, the redirects and menu files, reserved addresses.
 * - `pageFiles`: for sites whose pages are one content file each (features.pages: false, cms/collections.yml), every
 *   page file (JSON under src/content/) with its CMS fields and address (the file's preview_path). An AI may change
 *   their text and images, never add or delete them: each has its own design in the site's code.
 * - `addresses`: every page the build made, so menu links and redirects can be checked against real pages.
 * - `settings`: the Site settings files an AI may change (only for people given "Site settings too" by an admin), with
 *   their CMS fields and the parts that stay locked (form recipients, tracking, logos…). The AI connector's own switch
 *   (ai.json) is never in this list.
 */

/**
 * Site settings an AI may change (by the settings entry's name in the CMS config (cms/*.yml)), and what stays locked in
 * each: dot paths, where * is any key or list item. Locked parts are kept as they are and hidden from the AI. Files
 * not listed here (ai.json above all) can't be changed by an AI.
 */
const FORM_LOCKS = ['form.name', 'form.endpoint', 'form.redirect', 'form.turnstile', 'form.notifications'];

const AI_SETTINGS: Record<string, string[]> = {
	site: ['url', 'discourage_search_engines', 'locale', 'language', 'favicon', 'tracking', 'schema.logo'],
	navigation: [],
	header: ['logo'],
	footer: ['logo', 'holdings'],
	cta: [],
	redirects: [],
	'not-found': [],
	// Forms: the texts and fields may change; where leads go (and the spam check) may not.
	popups: FORM_LOCKS.flatMap((p) => [`book_now.${p}`, `exit_intent.${p}`, `page_forms.*.${p}`]).concat(['book_now.id', 'exit_intent.id', 'page_forms.*.id']),
	chat: ['id', 'endpoint', 'redirect', 'notifications'],
};

interface CmsField {
	name: string;
	label?: string;
	widget?: string;
	hint?: string;
	required?: boolean;
	default?: unknown;
	options?: { value: unknown; label?: string }[];
	fields?: CmsField[];
	types?: { name: string; label?: string; fields: CmsField[] }[];
}

function simplifyField(raw: Record<string, unknown>): CmsField {
	const field: CmsField = { name: String(raw.name) };
	for (const key of ['label', 'widget', 'hint', 'required', 'default'] as const) if (raw[key] !== undefined) (field as unknown as Record<string, unknown>)[key] = raw[key];
	if (Array.isArray(raw.options))
		field.options = raw.options.map((o) => (o && typeof o === 'object' ? { value: (o as Record<string, unknown>).value, label: (o as Record<string, unknown>).label as string | undefined } : { value: o }));
	if (Array.isArray(raw.fields)) field.fields = raw.fields.map((f) => simplifyField(f as Record<string, unknown>));
	if (raw.field && typeof raw.field === 'object') field.fields = [simplifyField(raw.field as Record<string, unknown>)];
	if (Array.isArray(raw.types))
		field.types = raw.types.map((t) => {
			const type = t as Record<string, unknown>;
			return { name: String(type.name), label: type.label as string | undefined, fields: ((type.fields as Record<string, unknown>[]) ?? []).map(simplifyField) };
		});
	return field;
}

/**
 * A settings field for the AI connector's checks: like simplifyField, but a list of plain values keeps its one `field`
 * (so it isn't mistaken for a list of objects), and url/email types and patterns are kept.
 */
function settingsField(raw: Record<string, unknown>): Record<string, unknown> {
	const field: Record<string, unknown> = { ...simplifyField(raw) };
	delete field.fields;
	if (Array.isArray(raw.fields)) field.fields = raw.fields.map((f) => settingsField(f as Record<string, unknown>));
	if (raw.field && typeof raw.field === 'object') field.field = settingsField(raw.field as Record<string, unknown>);
	if (typeof raw.type === 'string') field.type = raw.type;
	if (Array.isArray(raw.pattern)) field.pattern = raw.pattern;
	return field;
}

const jsonSchema = (schema: z.ZodType) =>
	z.toJSONSchema(schema, {
		io: 'input',
		unrepresentable: 'any',
		// Dates (z.coerce.date) are written as "YYYY-MM-DD" in the front matter.
		override: (ctx) => {
			const def = (ctx.zodSchema as unknown as { _zod: { def: { type: string } } })._zod.def;
			if (def.type === 'date') Object.assign(ctx.jsonSchema, { type: 'string', format: 'date' });
		},
	});

// Only the title is required (the build fills in the rest, see content-schemas.ts); Zod lists fields with fallbacks as required.
const titleOnly = (schema: ReturnType<typeof jsonSchema>) => ({ ...schema, required: ['title'] });

/** The site's page and post schemas (from createPageSchema / createPostSchema). */
export interface ContentRulesOptions {
	/** `pages` only for sites whose pages are made of sections (cms/features.yml → features.pages). */
	schemas: { pages?: z.ZodType; posts: z.ZodType };
}

export default function contentRules({ schemas }: ContentRulesOptions): AstroIntegration {
	return {
		name: 'content-rules',
		hooks: {
			// Pages and posts share the site root, so no two may have the same address. The CMS stops this on save; this
			// catches the rest (files edited directly). Astro itself only warns when two posts share a URL slug, and drops one.
			'astro:build:start': () => {
				const root = process.cwd();
				const profile = readSiteProfile(root);
				// Posts under their own path (/blog/<post>/) only have to differ from each other.
				const atRoot = profile.blog_path === '/';
				const seen = new Map<string, string>();
				const seenPosts = new Map<string, string>();
				const problems: string[] = [];
				const reserved = new Set(['admin', 'api', 'kit', 'uploads', '_astro']);
				for (const [folder, label, useSlug] of [['src/content/pages', 'page', false], ['src/content/posts', 'post', true]] as const) {
					const dir = path.join(root, folder);
					if (!fs.existsSync(dir) || (label === 'page' && !profile.features.pages)) continue;
					const seen_ = label === 'post' && !atRoot ? seenPosts : seen;
					for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.md')).sort()) {
						const base = name.slice(0, -3);
						if (folder.endsWith('pages') && base === 'index') continue;
						const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(path.join(dir, name), 'utf8'));
						const data = (fm ? YAML.parse(fm[1]) : {}) as { slug?: unknown };
						const address = String((useSlug && typeof data.slug === 'string' && data.slug.trim()) || base).toLowerCase();
						const where = `${folder}/${name}`;
						const shown = label === 'post' ? `${profile.blog_path}${address}/` : `/${address}/`;
						if ((label === 'page' || atRoot) && reserved.has(address)) problems.push(`The ${label} ${where} has the address ${shown}, which the site uses itself.`);
						if (seen_.has(address)) problems.push(`The ${label} ${where} has the address ${shown}, which ${seen_.get(address)} already uses.`);
						else seen_.set(address, where);
					}
				}
				if (problems.length) throw new Error(`Two pages can't share an address. Change one of them in the CMS (title or URL slug):\n- ${problems.join('\n- ')}`);
			},
			'astro:build:done': ({ dir, logger }) => {
				const root = process.cwd();
				const outDir = fileURLToPath(dir);
				const profile = readSiteProfile(root);
				if (!profile.features.ai_connector) {
					logger.info('admin/content-rules.json: not written (the AI connector is off for this site).');
					return;
				}
				const config = readCmsConfig(root) as {
					media_folder?: string;
					public_folder?: string;
					collections: Record<string, unknown>[];
				};
				const collection = (name: string) => config.collections.find((c) => c.name === name) as Record<string, unknown> | undefined;
				const cmsFields = (name: string) => ((collection(name)?.fields as Record<string, unknown>[]) ?? []).map(simplifyField);
				const settingsFiles = ((collection('settings')?.files as Record<string, unknown>[]) ?? []).filter((f) => f.name !== 'ai' && AI_SETTINGS[String(f.name)]);
				const settings = settingsFiles.map((f) => ({
					name: String(f.name),
					label: f.label as string | undefined,
					file: String(f.file),
					locked: AI_SETTINGS[String(f.name)],
					cms: ((f.fields as Record<string, unknown>[]) ?? []).map(settingsField),
				}));
				// Taken addresses that aren't pages or posts: build files (robots.txt, sitemap.xml…) and folders without a page.
				const reserved = fs
					.readdirSync(outDir, { withFileTypes: true })
					.filter((e) => (e.isDirectory() ? !fs.existsSync(path.join(outDir, e.name, 'index.html')) : !e.name.endsWith('.html')))
					.map((e) => e.name.replace(/\.[a-z0-9]+$/i, ''));
				// Every page the build made (/, /about/, /blog/a-post/…), except the CMS itself.
				const addresses: string[] = [];
				const walk = (dirPath: string, address: string) => {
					if (fs.existsSync(path.join(dirPath, 'index.html')) && address !== '/admin/') addresses.push(address);
					for (const e of fs.readdirSync(dirPath, { withFileTypes: true }))
						if (e.isDirectory() && !['_astro', 'uploads', 'admin'].includes(e.name)) walk(path.join(dirPath, e.name), `${address}${e.name}/`);
				};
				walk(outDir, '/');
				// Pages that are one content file each (the site's own file collections, JSON under src/content/).
				const pageFiles = profile.features.pages
					? []
					: config.collections
							.filter((c) => c.name !== 'settings' && Array.isArray(c.files))
							.flatMap((c) =>
								(c.files as Record<string, unknown>[])
									.filter((f) => typeof f.file === 'string' && f.file.startsWith('src/content/') && f.file.endsWith('.json'))
									.map((f) => ({
										name: String(f.name),
										label: (f.label as string | undefined) ?? String(f.name),
										group: (c.label as string | undefined) ?? String(c.name),
										file: String(f.file),
										...(typeof f.preview_path === 'string' ? { address: `/${f.preview_path.replace(/^\/+/, '')}` } : {}),
										cms: ((f.fields as Record<string, unknown>[]) ?? []).map(settingsField),
									})),
							);
				const rules = {
					version: 1,
					builtAt: new Date().toISOString(),
					collections: {
						...(profile.features.pages && schemas.pages ? { pages: {
							folder: 'src/content/pages',
							// The home page is index.md (/); every other page is /<file name>/.
							address: '/{file}/',
							home: 'index',
							// Pages built by their own route (blog.md is the /blog/ list): they can't be deleted through the connector.
							protected: ['blog'],
							body: false,
							schema: titleOnly(jsonSchema(schemas.pages)),
							cms: cmsFields('pages'),
						} } : {}),
						posts: {
							folder: 'src/content/posts',
							// /<slug>/: the front matter's slug when set, otherwise the file name.
							address: `${profile.blog_path}{slug|file}/`,
							body: 'markdown',
							schema: titleOnly(jsonSchema(schemas.posts)),
							cms: cmsFields('posts'),
						},
					},
					media: { folder: config.media_folder ?? 'public/uploads', public: config.public_folder ?? '/uploads' },
					redirects: 'src/data/redirects.json',
					menus: ['src/data/navigation.json'],
					...(pageFiles.length ? { pageFiles } : {}),
					addresses: addresses.sort(),
					settings,
					// Addresses that are taken by something other than a page or post (folders and files the build makes).
					reserved: [...new Set(['admin', 'blog', 'uploads', 'api', 'kit', ...reserved])].sort(),
				};
				fs.mkdirSync(path.join(outDir, 'admin'), { recursive: true });
				fs.writeFileSync(path.join(outDir, 'admin/content-rules.json'), JSON.stringify(rules));
				logger.info(`admin/content-rules.json: page and post rules for the CMS's AI connector.`);
			},
		},
	};
}
