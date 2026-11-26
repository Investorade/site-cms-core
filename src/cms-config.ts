import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import YAML from 'yaml';

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

const coreDir = fileURLToPath(new URL('../cms/', import.meta.url));

const HEADER = `# Made by the CMS core (@investorade/site-cms-core) when the site builds. Don't edit this file:
# change the site's cms/*.yml (sections, its own Site settings, repo, CMS title) or the core's cms/*.yml.
`;

function readYaml(file: string, fields?: Obj): unknown {
	const customTags = [
		{
			tag: '!core',
			resolve(name: string) {
				if (!fields || !(name in fields)) throw new Error(`"!core ${name}" is not a shared field set. There are: ${Object.keys(fields ?? {}).join(', ')}.`);
				return structuredClone(fields[name]);
			},
		},
	];
	try {
		return YAML.parse(fs.readFileSync(file, 'utf8'), { customTags });
	} catch (error) {
		throw new Error(`The CMS config file ${file} is not valid: ${(error as Error).message}`);
	}
}

const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);

/** The site's CMS config as data. `root` is the site's folder. */
export function readCmsConfig(root: string): Obj {
	const siteDir = path.join(root, 'cms');
	const fields = readYaml(path.join(coreDir, 'fields.yml')) as Obj;
	const core = (name: string) => readYaml(path.join(coreDir, name), fields);
	const site = (name: string, required = false) => {
		const file = path.join(siteDir, name);
		if (!fs.existsSync(file)) {
			if (required) throw new Error(`The site's CMS config is missing: ${file}. See the site-cms-core README ("CMS config").`);
			return undefined;
		}
		return readYaml(file, fields);
	};

	const base = core('base.yml') as Obj;
	const pages = core('pages.yml') as Obj;
	const posts = core('posts.yml') as Obj;
	const settings = core('settings.yml') as Obj;
	const siteConfig = (site('site.yml', true) ?? {}) as Obj;
	const sections = site('sections.yml') ?? [];
	const siteSettings = site('settings.yml') ?? [];
	if (!isObj(siteConfig)) throw new Error('cms/site.yml must hold settings (backend:, app_title: …), not a list.');
	if (!Array.isArray(sections)) throw new Error('cms/sections.yml must be a list of section types (- name: hero …).');
	if (!Array.isArray(siteSettings)) throw new Error('cms/settings.yml must be a list of Site settings files (- name: header …).');

	const { backend: siteBackend, collections: inlineCollections = [], ...siteTop } = siteConfig;
	if (!isObj(siteBackend) || typeof siteBackend.repo !== 'string') throw new Error('cms/site.yml needs the GitHub repo: backend: { repo: Owner/name }.');
	if (!Array.isArray(inlineCollections)) throw new Error('cms/site.yml: collections must be a list.');
	// The site's own collections: in site.yml (collections:) and/or cms/collections.yml (a list), e.g. pages built from
	// one data file each, for sites whose pages aren't made of sections.
	const fileCollections = site('collections.yml') ?? [];
	if (!Array.isArray(fileCollections)) throw new Error('cms/collections.yml must be a list of collections (- name: treatments …).');
	const siteCollections = [...inlineCollections, ...fileCollections];
	// Extra post fields (cms/post-fields.yml, a list): shown before the post's SEO fields. The site's post schema adds
	// the same fields (createPostSchema({ extend })).
	const postFields = site('post-fields.yml') ?? [];
	if (!Array.isArray(postFields)) throw new Error('cms/post-fields.yml must be a list of fields (- name: author …).');
	if (postFields.length) {
		const fields = posts.fields as Obj[];
		const at = fields.findIndex((f) => f.name === 'seo');
		fields.splice(at < 0 ? fields.length : at, 0, ...(postFields as Obj[]));
	}

	// Page sections: the site's types. A site without sections has no "Page sections" field.
	const pageFields = pages.fields as Obj[];
	const blocks = pageFields.find((f) => f.name === 'content_blocks');
	if (blocks) {
		if (sections.length) blocks.types = sections;
		else pageFields.splice(pageFields.indexOf(blocks), 1);
	}
	settings.files = [...((settings.files as Obj[]) ?? []), ...siteSettings];

	const names = new Set<string>();
	for (const file of settings.files as Obj[]) {
		if (names.has(String(file.name))) throw new Error(`Two Site settings files are called "${file.name}" (the core's and cms/settings.yml). Give the site's another name.`);
		names.add(String(file.name));
	}

	// What this site uses (cms/features.yml): the blog and the AI connector settings only when switched on.
	const profile = readSiteProfile(root);
	if (!profile.features.ai_connector) settings.files = (settings.files as Obj[]).filter((f) => f.name !== 'ai');
	// The shared 404 page settings: for sites with the core's pages, or a site whose own 404 page reads the file.
	if (!profile.features.pages && !fs.existsSync(path.join(root, 'src', 'data', 'not-found.json')))
		settings.files = (settings.files as Obj[]).filter((f) => f.name !== 'not-found');
	// Posts under a blog path: where each post is, for the CMS's Quick Preview and "view on site" (blog/{{slug}}/).
	// Posts at the site root need none (the preview already uses /<slug>/).
	if (profile.blog_path !== '/') {
		const { fields, ...rest } = posts;
		for (const key of Object.keys(posts)) delete posts[key];
		Object.assign(posts, rest, { preview_path: `${profile.blog_path.slice(1)}{{slug}}/`, fields });
	}

	const config = {
		...base,
		backend: { ...(base.backend as Obj), ...siteBackend },
		...siteTop,
		collections: [...(profile.features.pages ? [pages] : []), ...(profile.features.blog ? [posts] : []), ...siteCollections, { divider: true }, settings],
	};
	return fillWording(config, wordingFor(root, profile)) as Obj;
}

// ── Site type, features and wording ──

export type SiteType = 'park' | 'business' | 'medical';
const SITE_TYPES: SiteType[] = ['park', 'business', 'medical'];
const FEATURES = ['pages', 'blog', 'popups', 'ai_connector'] as const;
export interface SiteProfile {
	site_type: SiteType;
	features: { pages: boolean; blog: boolean; popups: boolean; ai_connector: boolean };
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
export function readSiteProfile(root: string): SiteProfile {
	const file = path.join(root, 'cms', 'features.yml');
	const raw = (fs.existsSync(file) ? readYaml(file) : {}) as Obj | null;
	if (raw !== null && !isObj(raw)) throw new Error('cms/features.yml must hold settings (site_type:, features: …), not a list.');
	const data = raw ?? {};
	const type = (data.site_type ?? 'business') as SiteType;
	if (!SITE_TYPES.includes(type)) throw new Error(`cms/features.yml: site_type must be ${SITE_TYPES.join(', ')}; not "${String(type)}".`);
	const features = (data.features ?? {}) as Obj;
	if (!isObj(features)) throw new Error('cms/features.yml: features must be a list of switches (blog: true …).');
	for (const [key, value] of Object.entries(features)) {
		if (!(FEATURES as readonly string[]).includes(key)) throw new Error(`cms/features.yml: unknown feature "${key}" (there are ${FEATURES.join(', ')}).`);
		if (typeof value !== 'boolean') throw new Error(`cms/features.yml: ${key} must be true or false.`);
	}
	const blogPath = data.blog_path ?? '/';
	if (typeof blogPath !== 'string' || !/^\/([a-z0-9-]+\/)*$/.test(blogPath)) throw new Error('cms/features.yml: blog_path must look like / or /blog/.');
	const wording = (data.wording ?? {}) as Obj;
	if (!isObj(wording) || Object.values(wording).some((v) => typeof v !== 'string')) throw new Error('cms/features.yml: wording must map names to texts.');
	const pages = features.pages !== false;
	return {
		site_type: type,
		features: {
			pages,
			blog: features.blog !== false,
			popups: typeof features.popups === 'boolean' ? features.popups : type === 'park',
			// The AI connector: on unless switched off. Sites whose pages are content files (pages: false) switch it on
			// themselves (ai_connector: true): the AI can change those pages' text and images, not add or delete pages.
			ai_connector: pages ? features.ai_connector !== false : features.ai_connector === true,
		},
		blog_path: blogPath,
		wording: wording as Record<string, string>,
	};
}

const slug = (v: string) => v.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** The texts for [[name]] in the core's CMS files: the type's examples (cms/wording.yml), the site's own, and the
 * feature-dependent bits. {name}, {city} and {region} in them come from the site's src/data/site.json. */
function wordingFor(root: string, profile: SiteProfile): Record<string, string> {
	const table = readYaml(path.join(coreDir, 'wording.yml')) as Record<string, Record<string, string>>;
	const popups = profile.features.popups;
	const words: Record<string, string> = {
		...table[profile.site_type],
		...profile.wording,
		or_popup_link: popups ? ', or #book-now to open the Book Now popup' : '',
		popup_link_sentence: popups ? ' Use #book-now to open the Book Now popup.' : '',
		link_choices: popups ? ', a full URL or #book-now' : ' or a full URL',
	};
	let info: { name?: string; address?: { city?: string; region?: string } } = {};
	try {
		info = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'site.json'), 'utf8'));
	} catch {
		// No site.json: the placeholders stay generic.
	}
	const city = info.address?.city || 'your city';
	const region = info.address?.region || '';
	const values: Record<string, string> = { name: info.name || 'your business', city, region, 'city-slug': slug(city), 'region-slug': slug(region) };
	for (const key of Object.keys(words)) words[key] = words[key].replace(/\{([\w-]+)\}/g, (m, k: string) => values[k] ?? m).replace(/ +/g, ' ').replace(/-+\//g, '/');
	// Posts at the root (/<post>/, as on WordPress) or under the site's blog path (/blog/<post>/).
	const post = profile.blog_path === '/' ? words.post_address_example : profile.blog_path.replace(/\/$/, '') + words.post_address_example;
	words.post_address_example = post;
	words.post_location =
		profile.blog_path === '/' ? `Each post is at the site root, e.g. ${post} (as on WordPress)` : `Each post is under ${profile.blog_path}, e.g. ${post}`;
	return words;
}

function fillWording(value: unknown, words: Record<string, string>): unknown {
	if (typeof value === 'string')
		return value.replace(/\[\[([\w-]+)\]\]/g, (_, key: string) => {
			if (!(key in words)) throw new Error(`The CMS core's config uses [[${key}]], which cms/wording.yml doesn't define.`);
			return words[key];
		});
	if (Array.isArray(value)) return value.map((v) => fillWording(v, words));
	if (isObj(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillWording(v, words)]));
	return value;
}

/** The site's /admin/config.yml as text. */
export function cmsConfigYaml(root: string): string {
	return HEADER + '\n' + YAML.stringify(readCmsConfig(root), { lineWidth: 0 });
}

/** Serves /admin/config.yml in dev, checks it before the build and writes it to dist/admin/config.yml after. */
export default function cmsConfig(): AstroIntegration {
	let root = process.cwd();
	return {
		name: 'site-cms-core/cms-config',
		hooks: {
			'astro:config:setup': ({ config }) => {
				root = fileURLToPath(config.root);
				if (fs.existsSync(path.join(root, 'public/admin/config.yml')))
					throw new Error("public/admin/config.yml is made by the CMS core now. Move the site's parts to cms/site.yml, cms/sections.yml and cms/settings.yml, then delete it.");
			},
			'astro:server:setup': ({ server }) => {
				server.middlewares.use((req, res, next) => {
					if ((req.url ?? '').split('?')[0] !== '/admin/config.yml') return next();
					try {
						const body = cmsConfigYaml(root);
						res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
						res.setHeader('Cache-Control', 'no-store');
						res.end(body);
					} catch (error) {
						res.statusCode = 500;
						res.setHeader('Content-Type', 'text/plain; charset=utf-8');
						res.end((error as Error).message);
					}
				});
			},
			// Fail early (before pages are built) when a cms/*.yml file is broken.
			'astro:build:start': () => {
				readCmsConfig(root);
			},
			'astro:build:done': ({ dir, logger }) => {
				const file = path.join(fileURLToPath(dir), 'admin', 'config.yml');
				fs.mkdirSync(path.dirname(file), { recursive: true });
				fs.writeFileSync(file, cmsConfigYaml(root));
				logger.info('admin/config.yml: the CMS config (core + cms/*.yml).');
			},
		},
	};
}
